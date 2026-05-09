import cv2
import imutils 
import numpy as np
import pytesseract

pytesseract.pytesseract.tesseract_cmd = r"/usr/bin/tesseract"

image_path = r"/home/alex/Magna-Echipa-1/test_images/car.png"

#Read original image
img = cv2.imread(image_path)

if img is None:
    raise FileNotFoundError("The image wasnt found!")

#=======STEP 1==============
#resize image to 620x480  
#img = cv2.resize(img, (int(620 * 1.5),int(480 * 1.5)))

#=======STEP 2==============
#convert image to grayscale
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

#=======STEP 3==============
#apply blur
gray = cv2.bilateralFilter(gray, 11, 17, 17)

#=======STEP 4==============
#perform edge detection
edged = cv2.Canny(gray, 30, 200)

#sort first 10 contours
cnts = cv2.findContours(edged.copy(), cv2.RETR_TREE,     
cv2.CHAIN_APPROX_SIMPLE)
cnts = imutils.grab_contours(cnts)
cnts = sorted(cnts, key = cv2.contourArea, reverse = True)[:10]
screenCnt = None

#=======STEP 5==============
#loop over contours
for c in cnts:
    #approximate the contour
    peri = cv2.arcLength(c, True) 
    approx = cv2.approxPolyDP(c, 0.018 * peri, True)
    if len(approx) == 4:
        screenCnt = approx
        break

#=======STEP 6==============
# draw detected rectangle on original image
detected_img = img.copy()
cv2.drawContours(detected_img, [screenCnt], -1, (0, 255, 0), 3)
# mask everything except the license plate 
mask = np.zeros(gray.shape, np.uint8)
cv2.drawContours(mask, [screenCnt], 0, 255, -1)
masked = cv2.bitwise_and(gray, gray, mask=mask)  
#crop based on ROI
(x,y) = np.where(mask == 255)
(topx, topy) = (np.min(x), np.min(y))
(bottom, bottomy)  = (np.max(x), np.max(y))
cropped = gray[topx:bottom+1, topy:bottomy+1]

#read number plate text
text = pytesseract.image_to_string(cropped, config='--psm 7')
print("Detect number plate is:", text)


cv2.imshow("Original image", img)
cv2.imshow("Grayscale", gray)
cv2.imshow("Edges", edged)
cv2.imshow("Detected Plate", detected_img)
cv2.imshow("Masked Plate", masked)
cv2.imshow("Cropped Plate", cropped)

cv2.waitKey(0)
cv2.destroyAllWindows()
