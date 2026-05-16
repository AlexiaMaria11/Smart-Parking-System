"""
parking_display.py  –  RPi 5 port of the Arduino parking-spot counter
Display : GC9A01  1.28" round TFT  240×240  SPI
Author  : converted from Arduino/TFT_eSPI

RPi 5 note: uses lgpio instead of RPi.GPIO (RPi.GPIO does not support the
            RPi 5's RP1 south-bridge chip and raises:
            "Cannot determine SOC peripheral base address")

Install deps:
    pip install lgpio spidev pillow

Wiring (BCM numbering):
  CLK  → GPIO 11  (SPI0 CLK,  physical 23)
  MOSI → GPIO 10  (SPI0 MOSI, physical 19)
  CS   → GPIO  8  (SPI0 CE0,  physical 24)
  DC   → GPIO 25             (physical 22)
  RST  → GPIO 24             (physical 18)
  BL   → GPIO 18  (PWM)      (physical 12)  or tie to 3.3 V
  VCC  → 3.3 V               (physical  1)
  GND  → GND                 (physical  6)
"""

import time
import spidev
import lgpio                          # RPi 5 compatible GPIO library
from PIL import Image, ImageDraw, ImageFont

# ── Pin configuration (BCM) ───────────────────────────────────────────────────
PIN_DC  = 25
PIN_RST = 24
PIN_BL  = 18        # set to None if backlight is wired directly to 3.3 V

# lgpio chip handle (opened in gpio_setup)
_chip = None

# ── Display geometry ──────────────────────────────────────────────────────────
WIDTH  = 240
HEIGHT = 240

# ── Colour palette (RGB tuples) ───────────────────────────────────────────────
C_BG    = (  0,   0,   0)   # black background
C_RING  = (  0, 255, 255)   # cyan ring
C_DIV   = ( 96,  96,  96)   # subtle grey separator
C_TEXT  = (255, 255, 255)   # white text
C_CAR   = (255, 104,   0)   # orange body
C_WIN   = (  0,  56, 159)   # dark-blue windows
C_WHEEL = ( 80,  80,  80)   # grey tyre
C_HUB   = ( 48,  48,  48)   # darker hub
C_HEAD  = (255, 224,   0)   # yellow headlight
C_TAIL  = (255,   0,   0)   # red tail-light

# ── App state ─────────────────────────────────────────────────────────────────
LOCURI_MAX   = 10
locuri_ramase = LOCURI_MAX


# ─────────────────────────────────────────────────────────────────────────────
#  GC9A01 low-level driver (raw SPI)
# ─────────────────────────────────────────────────────────────────────────────

spi = spidev.SpiDev()

def gpio_setup():
    global _chip
    _chip = lgpio.gpiochip_open(0)      # /dev/gpiochip0 on RPi 5
    lgpio.gpio_claim_output(_chip, PIN_DC)
    lgpio.gpio_claim_output(_chip, PIN_RST)
    if PIN_BL is not None:
        lgpio.gpio_claim_output(_chip, PIN_BL)
        lgpio.gpio_write(_chip, PIN_BL, 1)  # backlight on

def gpio_write(pin: int, value: int):
    lgpio.gpio_write(_chip, pin, value)

def spi_setup():
    spi.open(0, 0)                       # bus 0, device 0 (CE0)
    spi.max_speed_hz = 40_000_000        # 40 MHz – safe for most GC9A01 modules
    spi.mode = 0

def write_cmd(cmd: int):
    gpio_write(PIN_DC, 0)               # DC low = command
    spi.writebytes([cmd])

def write_data(data):
    gpio_write(PIN_DC, 1)               # DC high = data
    if isinstance(data, int):
        spi.writebytes([data])
    else:
        # send in 4096-byte chunks to avoid SPI buffer limits
        mv = memoryview(bytes(data))
        for i in range(0, len(mv), 4096):
            spi.writebytes2(mv[i:i + 4096])

def reset_display():
    gpio_write(PIN_RST, 1)
    time.sleep(0.1)
    gpio_write(PIN_RST, 0)
    time.sleep(0.1)
    gpio_write(PIN_RST, 1)
    time.sleep(0.2)

def init_gc9a01():
    """Minimal GC9A01 init sequence."""
    reset_display()

    # Inner register enable
    write_cmd(0xEF)
    write_cmd(0xEB); write_data(0x14)
    write_cmd(0xFE)
    write_cmd(0xEF)
    write_cmd(0xEB); write_data(0x14)
    write_cmd(0x84); write_data(0x40)
    write_cmd(0x85); write_data(0xFF)
    write_cmd(0x86); write_data(0xFF)
    write_cmd(0x87); write_data(0xFF)
    write_cmd(0x88); write_data(0x0A)
    write_cmd(0x89); write_data(0x21)
    write_cmd(0x8A); write_data(0x00)
    write_cmd(0x8B); write_data(0x80)
    write_cmd(0x8C); write_data(0x01)
    write_cmd(0x8D); write_data(0x01)
    write_cmd(0x8E); write_data(0xFF)
    write_cmd(0x8F); write_data(0xFF)
    # Display function control
    write_cmd(0xB6); write_data(0x00); write_data(0x00)
    # Memory access / colour order (RGB, row-major)
    write_cmd(0x36); write_data(0x48)
    # 16-bit colour (RGB565)
    write_cmd(0x3A); write_data(0x05)
    # Blanking porch
    write_cmd(0x90); write_data(0x08); write_data(0x08); write_data(0x08); write_data(0x08)
    write_cmd(0xBD); write_data(0x06)
    write_cmd(0xBC); write_data(0x00)
    write_cmd(0xFF); write_data(0x60); write_data(0x01); write_data(0x04)
    write_cmd(0xC3); write_data(0x13)
    write_cmd(0xC4); write_data(0x13)
    write_cmd(0xC9); write_data(0x22)
    write_cmd(0xBE); write_data(0x11)
    write_cmd(0xE1); write_data(0x10); write_data(0x0E)
    write_cmd(0xDF); write_data(0x21); write_data(0x0C); write_data(0x02)
    # Gamma
    write_cmd(0xF0); write_data(0x45); write_data(0x09); write_data(0x08); write_data(0x08); write_data(0x26); write_data(0x2A)
    write_cmd(0xF1); write_data(0x43); write_data(0x70); write_data(0x72); write_data(0x36); write_data(0x37); write_data(0x6F)
    write_cmd(0xF2); write_data(0x45); write_data(0x09); write_data(0x08); write_data(0x08); write_data(0x26); write_data(0x2A)
    write_cmd(0xF3); write_data(0x43); write_data(0x70); write_data(0x72); write_data(0x36); write_data(0x37); write_data(0x6F)
    write_cmd(0xED); write_data(0x1B); write_data(0x0B)
    write_cmd(0xAE); write_data(0x77)
    write_cmd(0xCD); write_data(0x63)
    write_cmd(0x70); write_data(0x07); write_data(0x07); write_data(0x04); write_data(0x0E); write_data(0x0F); write_data(0x09); write_data(0x07); write_data(0x08); write_data(0x03)
    write_cmd(0xE8); write_data(0x34)
    write_cmd(0x62)
    write_data(0x18); write_data(0x0D); write_data(0x71); write_data(0xED)
    write_data(0x70); write_data(0x70); write_data(0x18); write_data(0x0F)
    write_data(0x71); write_data(0xEF); write_data(0x70); write_data(0x70)
    write_cmd(0x63)
    write_data(0x18); write_data(0x11); write_data(0x71); write_data(0xF1)
    write_data(0x70); write_data(0x70); write_data(0x18); write_data(0x13)
    write_data(0x71); write_data(0xF3); write_data(0x70); write_data(0x70)
    write_cmd(0x64); write_data(0x28); write_data(0x29); write_data(0xF1); write_data(0x01); write_data(0xF1); write_data(0x00); write_data(0x07)
    write_cmd(0x66); write_data(0x3C); write_data(0x00); write_data(0xCD); write_data(0x67); write_data(0x45); write_data(0x45); write_data(0x10); write_data(0x00); write_data(0x00); write_data(0x00)
    write_cmd(0x67); write_data(0x00); write_data(0x3C); write_data(0x00); write_data(0x00); write_data(0x00); write_data(0x01); write_data(0x54); write_data(0x10); write_data(0x32); write_data(0x98)
    write_cmd(0x74); write_data(0x10); write_data(0x85); write_data(0x80); write_data(0x00); write_data(0x00); write_data(0x4E); write_data(0x00)
    write_cmd(0x98); write_data(0x3E); write_data(0x07)
    write_cmd(0x35)          # Tearing effect ON
    write_cmd(0x21)          # Display inversion ON  (needed for correct colours)
    write_cmd(0x11)          # Sleep out
    time.sleep(0.12)
    write_cmd(0x29)          # Display on
    time.sleep(0.02)

def set_window(x0, y0, x1, y1):
    write_cmd(0x2A)
    write_data([x0 >> 8, x0 & 0xFF, x1 >> 8, x1 & 0xFF])
    write_cmd(0x2B)
    write_data([y0 >> 8, y0 & 0xFF, y1 >> 8, y1 & 0xFF])
    write_cmd(0x2C)

def send_image(img: Image.Image):
    """Convert PIL RGB image → RGB565 and push to the display."""
    set_window(0, 0, WIDTH - 1, HEIGHT - 1)
    raw   = img.tobytes()          # 24-bit RGB
    buf   = bytearray(WIDTH * HEIGHT * 2)
    for i in range(WIDTH * HEIGHT):
        r = raw[i * 3]
        g = raw[i * 3 + 1]
        b = raw[i * 3 + 2]
        rgb565 = ((r & 0xF8) << 8) | ((g & 0xFC) << 3) | (b >> 3)
        buf[i * 2]     = (rgb565 >> 8) & 0xFF
        buf[i * 2 + 1] =  rgb565       & 0xFF
    write_data(buf)


# ─────────────────────────────────────────────────────────────────────────────
#  Rendering helpers  (mirrors the Arduino drawing functions)
# ─────────────────────────────────────────────────────────────────────────────

def rounded_rect(draw, x, y, w, h, r, fill):
    draw.rounded_rectangle([x, y, x + w, y + h], radius=r, fill=fill)

def draw_car(draw: ImageDraw.ImageDraw, cx: int, cy: int):
    """Draw the car icon centred on (cx, cy) – matches the Arduino version."""
    x = cx - 38
    y = cy - 20

    # body
    rounded_rect(draw, x,      y + 16, 76, 20, 5, C_CAR)
    # cabin
    rounded_rect(draw, x + 10, y,      56, 18, 5, C_CAR)
    # left window
    rounded_rect(draw, x + 13, y +  2, 22, 13, 2, C_WIN)
    # right window
    rounded_rect(draw, x + 38, y +  2, 22, 13, 2, C_WIN)
    # rear wheel
    draw.ellipse([x + 16 - 11, y + 36 - 11, x + 16 + 11, y + 36 + 11], fill=C_WHEEL)
    draw.ellipse([x + 16 -  5, y + 36 -  5, x + 16 +  5, y + 36 +  5], fill=C_HUB)
    # front wheel
    draw.ellipse([x + 60 - 11, y + 36 - 11, x + 60 + 11, y + 36 + 11], fill=C_WHEEL)
    draw.ellipse([x + 60 -  5, y + 36 -  5, x + 60 +  5, y + 36 +  5], fill=C_HUB)
    # headlight
    draw.rectangle([x + 68, y + 19, x + 68 + 6,  y + 19 + 8], fill=C_HEAD)
    # tail-light
    draw.rectangle([x +  2, y + 19, x +  2 + 5,  y + 19 + 8], fill=C_TAIL)


def build_frame(locuri: int) -> Image.Image:
    """Render a full 240×240 frame and return a PIL Image."""
    img  = Image.new("RGB", (WIDTH, HEIGHT), C_BG)
    draw = ImageDraw.Draw(img)

    # ── Double decorative ring ──
    draw.ellipse([ 2,  2, 237, 237], outline=C_RING, width=1)
    draw.ellipse([ 5,  5, 234, 234], outline=C_RING, width=1)

    # ── "LOCURI LIBERE" label ──
    # Try to load a bold TrueType font; fall back to default
    try:
        font_label = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 18)
    except OSError:
        font_label = ImageFont.load_default()

    label = "LOCURI LIBERE"
    bbox  = draw.textbbox((0, 0), label, font=font_label)
    lw    = bbox[2] - bbox[0]
    lx    = (WIDTH - lw) // 2
    draw.text((lx,     36), label, font=font_label, fill=C_TEXT)
    draw.text((lx + 1, 36), label, font=font_label, fill=C_TEXT)   # bold effect

    # ── Thin separator ──
    draw.line([(35, 64), (205, 64)], fill=C_DIV, width=1)

    # ── Large number ──
    try:
        font_num = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 80)
    except OSError:
        font_num = ImageFont.load_default()

    num_str = str(locuri)
    nbbox   = draw.textbbox((0, 0), num_str, font=font_num)
    nw      = nbbox[2] - nbbox[0]
    nh      = nbbox[3] - nbbox[1]
    nx      = (WIDTH  - nw) // 2
    ny      = 112 - nh // 2
    draw.text((nx, ny), num_str, font=font_num, fill=C_TEXT)

    # ── Car icon ──
    draw_car(draw, 120, 186)

    return img


# ─────────────────────────────────────────────────────────────────────────────
#  Main
# ─────────────────────────────────────────────────────────────────────────────

def main():
    global locuri_ramase

    gpio_setup()
    spi_setup()
    init_gc9a01()

    print("Display ready!")

    while True:
        time.sleep(1.5)

        if locuri_ramase > 0:
            locuri_ramase -= 1
            frame = build_frame(locuri_ramase)
            send_image(frame)
            print(f"Locuri ramase: {locuri_ramase}")
        else:
            time.sleep(3.0)
            locuri_ramase = LOCURI_MAX
            frame = build_frame(locuri_ramase)
            send_image(frame)
            print("Reset demo.")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nOprit.")
    finally:
        spi.close()
        if _chip is not None:
            lgpio.gpiochip_close(_chip)