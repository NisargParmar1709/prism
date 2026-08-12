import csv
from io import StringIO
from uuid import UUID
from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse

# Removing DB models for now since full schema is built in Week 2
from app.dependencies import get_current_user

router = APIRouter(prefix="/export", tags=["export"])

@router.get("/transactions.csv")
async def export_transactions_csv(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    account_id: Optional[UUID] = None,
    user_id: UUID = Depends(get_current_user),
):
    # For Week 1, return a mock CSV since Transaction/Category models are not fully implemented
    f = StringIO()
    writer = csv.writer(f)
    writer.writerow(["date", "account", "category", "type", "amount", "note", "status"])

    # Mock data row
    writer.writerow([
        date.today().isoformat(),
        "Mock Account",
        "Mock Category",
        "expense",
        "100.00",
        "Mock Note",
        "completed"
    ])
        
    f.seek(0)
    
    response = StreamingResponse(iter([f.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=transactions.csv"
    
    return response
