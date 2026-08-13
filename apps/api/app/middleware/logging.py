import time
import uuid
import json
import logging

logger = logging.getLogger("prism_api")
logger.setLevel(logging.INFO)
if not logger.handlers:
    handler = logging.StreamHandler()
    logger.addHandler(handler)

class StructuredLoggingMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] not in ("http", "websocket"):
            await self.app(scope, receive, send)
            return

        request_id = str(uuid.uuid4())
        # Attach to state if possible for other middlewares
        if "state" not in scope:
            scope["state"] = {}
        scope["state"]["request_id"] = request_id

        start_time = time.perf_counter()
        status_code = [500]

        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                status_code[0] = message.get("status", 500)
                # Add X-Request-ID header
                headers = message.get("headers", [])
                headers.append((b"x-request-id", request_id.encode()))
                message["headers"] = headers
            await send(message)

        try:
            await self.app(scope, receive, send_wrapper)
        finally:
            process_time = time.perf_counter() - start_time
            user_id = scope.get("state", {}).get("user_id", None)
            
            method = scope.get("method", "")
            path = scope.get("path", "")
            
            log_dict = {
                "request_id": request_id,
                "timestamp": time.time(),
                "method": method,
                "path": path,
                "status": status_code[0],
                "duration_ms": round(process_time * 1000, 2),
                "user_id": str(user_id) if user_id else None
            }
            logger.info(json.dumps(log_dict))
