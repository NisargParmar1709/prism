from pydantic import ValidationError
from datetime import date
from uuid import uuid4
import json

from app.schemas.transaction import TransactionUpdate

try:
    # Simulating payload from React frontend
    payload = {
        "amount": 50,
        "category_id": str(uuid4()),
        "date": "2023-10-25",
        "note": "",
        "status": "completed"
    }
    obj = TransactionUpdate(**payload)
    print("Success:", obj)
except ValidationError as e:
    print("Validation Error:")
    print(e.json())
