from pydantic import ValidationError, BaseModel, Field
from decimal import Decimal

class TransactionUpdate(BaseModel):
    amount: Decimal = Field(..., decimal_places=2)

try:
    payload = {"amount": 12.340000000000001} # simulated JS parsing
    obj = TransactionUpdate(**payload)
    print("Success:", obj)
except ValidationError as e:
    print("Validation Error:")
    print(e.json())
