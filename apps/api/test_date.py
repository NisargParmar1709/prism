from pydantic import ValidationError
from datetime import date
from uuid import uuid4
import json

from app.schemas.transaction import TransactionUpdate

try:
    payload = {
        "amount": 50,
        "category_id": str(uuid4()),
        "date": "2026-08-13T22:25:45.000Z",
        "note": "",
        "status": "completed"
    }
    obj = TransactionUpdate(**payload)
    print("Success:", obj)
except ValidationError as e:
    print("Validation Error:")
    print(e.json())
