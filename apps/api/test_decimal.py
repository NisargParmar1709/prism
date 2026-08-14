from pydantic import ValidationError, BaseModel, Field
from decimal import Decimal

class TransactionUpdate(BaseModel):
    amount: Decimal = Field(..., decimal_places=2)

try:
    payload = {"amount": 123.45} # JSON float
    obj = TransactionUpdate(**payload)
    print("Success:", obj)
except ValidationError as e:
    print("Validation Error:")
    print(e.json())
