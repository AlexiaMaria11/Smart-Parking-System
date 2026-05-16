import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Un singur dicționar curat, fără duplicate (Cheie: Valoare)
OCR_FIXES = {
    '0': 'O', 
    '1': 'I', 
    '2': 'Z', 
    '4': 'A', 
    '5': 'S', 
    '6': 'G', 
    '7': 'T', 
    '8': 'B',
    'Q': '0', 
    'D': '0'  
}

COUNTIES = [
    "AB", "AR", "AG", "B", "BC", "BH", "BN", "BT", "BV", "BR", "BZ",
    "CS", "CL", "CJ", "CT", "CV", "DB", "DJ", "GL", "GR", "GJ", "HR",
    "HD", "IL", "IS", "IF", "MM", "MH", "MS", "NT", "OT", "PH", "SM",
    "SJ", "SB", "SV", "TR", "TM", "TL", "VS", "VL", "VN"
]

def correct_string(s, target_type):
    """Corectează un string căutând atât în cheile, cât și în valorile dicționarului."""
    res = ""
    for char in s:
        inlocuitor = char 
        
        # Pasul 1: Căutăm în CHEI
        if char in OCR_FIXES:
            candidat = OCR_FIXES[char]
            if (target_type == 'letter' and candidat.isalpha()) or \
               (target_type == 'digit' and candidat.isdigit()):
                inlocuitor = candidat
                
        # Pasul 2: Căutăm în VALORI (dacă nu l-am găsit la Pasul 1)
        if inlocuitor == char:
            for cheie, valoare in OCR_FIXES.items():
                if valoare == char:
                    candidat = cheie
                    if (target_type == 'letter' and candidat.isalpha()) or \
                       (target_type == 'digit' and candidat.isdigit()):
                        inlocuitor = candidat
                        break 
        
        res += inlocuitor
    return res

def validate_letters_rules(letters):
    """Aplică regulile rutiere stricte pentru literele de la final."""
    if 'Q' in letters:
        return False, "Litera 'Q' nu este permisă pe plăcuțele din România."
    
    # Prima literă din combinația de 3 nu poate fi 'I' sau 'O'
    if len(letters) == 3 and letters[0] in ['I', 'O']:
        return False, f"Combinația de litere nu poate începe cu '{letters[0]}'."
        
    return True, "OK"

def parse_and_validate_plate(plate):
    # Curățăm inputul
    raw = re.sub(r'[\s\-]', '', plate.upper())

    # --- 1. CAZURI PARTICULARE ---
    if raw.startswith('MAI'):
        digits = correct_string(raw[3:], 'digit')
        if 3 <= len(digits) <= 5 and digits.isdigit():
            return True, f"MAI {digits}", "Ministerul Afacerilor Interne"

    if raw.startswith('CD') or raw.startswith('TC'):
        digits = correct_string(raw[2:], 'digit')
        if len(digits) == 6 and digits.isdigit():
            return True, f"{raw[:2]} {digits[:3]} {digits[3:]}", "Corp Diplomatic"

    if raw.startswith('A'):
        char2_as_digit = correct_string(raw[1:2], 'digit')
        if char2_as_digit.isdigit():
            digits = correct_string(raw[1:], 'digit')
            if 3 <= len(digits) <= 7 and digits.isdigit():
                return True, f"A {digits}", "Armata Română"

    # --- 2. FORMAT STANDARD & PROBE ---
    county = ""
    rest = ""
    
    prefix_2 = correct_string(raw[:2], 'letter') 
    prefix_1 = correct_string(raw[:1], 'letter')
    
    if len(raw) >= 3 and prefix_2 in COUNTIES:
        county = prefix_2
        rest = raw[2:]
    elif len(raw) >= 2 and prefix_1 == "B":
        county = "B"
        rest = raw[1:]
    else:
        return False, plate, "Nu s-a detectat un județ valid."

    if correct_string(rest[-5:], 'letter') == "PROBE":
        digits_part = rest[:-5]
        digits = correct_string(digits_part, 'digit')
        if 2 <= len(digits) <= 6 and digits.isdigit():
            return True, f"{county} {digits} PROBE", "Număr de Probe"

    # --- 3. VALIDAREA FINALĂ ---
    if len(rest) == 5: # Toate județele
        digits = correct_string(rest[:2], 'digit')
        letters = correct_string(rest[2:], 'letter')
        
        if digits.isdigit() and letters.isalpha():
            is_valid_letters, err_msg = validate_letters_rules(letters)
            if not is_valid_letters:
                return False, f"{county} {digits} {letters}", err_msg
            return True, f"{county} {digits} {letters}", "Standard"
            
    elif len(rest) == 6: # Doar București
        if county != "B":
            return False, raw, f"Județul {county} nu poate avea 3 cifre în formatul standard."
            
        digits = correct_string(rest[:3], 'digit')
        letters = correct_string(rest[3:], 'letter')
        
        if digits.isdigit() and letters.isalpha():
            is_valid_letters, err_msg = validate_letters_rules(letters)
            if not is_valid_letters:
                return False, f"{county} {digits} {letters}", err_msg
            return True, f"{county} {digits} {letters}", "Standard (București)"

    return False, raw, "Format invalid sau cifre/litere amestecate incorect."
