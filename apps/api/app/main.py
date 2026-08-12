from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import traceback

from .config import settings
from .middleware.logging import StructuredLoggingMiddleware
from .routers import api_router

app = FastAPI(
    title="Prism API",
    version="1.0"
)

# 1. Middlewares
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(StructuredLoggingMiddleware)

# 2. Global Exception Handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    request_id = getattr(request.state, "request_id", None)
    errors = {}
    for err in exc.errors():
        loc = ".".join(str(l) for l in err["loc"])
        if loc not in errors:
            errors[loc] = []
        errors[loc].append(err["msg"])

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Request body failed validation",
                "field_errors": errors,
                "request_id": request_id
            }
        }
    )

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    request_id = getattr(request.state, "request_id", None)
    
    if isinstance(exc.detail, dict) and "code" in exc.detail:
        error_detail = exc.detail
    else:
        error_detail = {
            "code": "NOT_FOUND" if exc.status_code == 404 else "HTTP_ERROR",
            "message": str(exc.detail),
            "request_id": request_id
        }
        
    if "request_id" not in error_detail:
        error_detail["request_id"] = request_id
        
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": error_detail}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    request_id = getattr(request.state, "request_id", None)
    traceback.print_exc()
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An unexpected server error occurred.",
                "request_id": request_id
            }
        }
    )

# 3. Health Check
@app.get("/health", status_code=200)
async def health_check():
    return {"status": "ok"}

# 4. Include Routers
app.include_router(api_router)
