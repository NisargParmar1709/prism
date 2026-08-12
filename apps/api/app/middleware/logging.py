import time
import uuid
import json
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
import logging

# We will just print the JSON string to stdout, or configure a basic logger
logger = logging.getLogger("prism_api")
logger.setLevel(logging.INFO)
if not logger.handlers:
    handler = logging.StreamHandler()
    logger.addHandler(handler)

class StructuredLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        start_time = time.perf_counter()
        
        try:
            response = await call_next(request)
            process_time = time.perf_counter() - start_time
            status_code = response.status_code
            
            user_id = getattr(request.state, "user_id", None)
            
            log_dict = {
                "request_id": request_id,
                "timestamp": time.time(),
                "method": request.method,
                "path": request.url.path,
                "status": status_code,
                "duration_ms": round(process_time * 1000, 2),
                "user_id": user_id
            }
            logger.info(json.dumps(log_dict))
            
            response.headers["X-Request-ID"] = request_id
            return response
            
        except Exception as e:
            process_time = time.perf_counter() - start_time
            status_code = 500
            
            user_id = getattr(request.state, "user_id", None)
            
            log_dict = {
                "request_id": request_id,
                "timestamp": time.time(),
                "method": request.method,
                "path": request.url.path,
                "status": status_code,
                "duration_ms": round(process_time * 1000, 2),
                "user_id": user_id
            }
            logger.info(json.dumps(log_dict))
            
            raise e
