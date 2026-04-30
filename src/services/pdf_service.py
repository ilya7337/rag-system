from io import BytesIO
from typing import Optional

import PyPDF2


class PDFService:
    @staticmethod
    def extract_text(pdf_bytes: bytes) -> Optional[str]:
        try:
            stream = BytesIO(pdf_bytes)
            reader = PyPDF2.PdfReader(stream)
            text_parts = []
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
            result = "\n\n".join(text_parts).strip()
            return result if result else None
        except Exception:
            return None
