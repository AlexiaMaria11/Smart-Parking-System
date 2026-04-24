# AI OCR Placeholder

This small service documents the intended OCR flow:

1. Capture frame
2. Detect plate
3. Extract OCR text
4. Send detected plate to backend

Run with:

```bash
uvicorn app:app --reload --port 8000
```
