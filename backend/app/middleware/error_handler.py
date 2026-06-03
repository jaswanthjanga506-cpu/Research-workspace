from flask import jsonify
from werkzeug.exceptions import HTTPException
from pydantic import ValidationError

def init_error_handlers(app):
    @app.errorhandler(ValidationError)
    def handle_pydantic_validation_error(e):
        errors = []
        for error in e.errors():
            errors.append({
                "field": " -> ".join(map(str, error["loc"])),
                "message": error["msg"]
            })
        return jsonify({
            "success": False,
            "message": errors[0]["message"] if errors else "Validation failed",
            "errors": errors
        }), 400

    @app.errorhandler(HTTPException)
    def handle_http_exception(e):
        return jsonify({
            "success": False,
            "message": e.description
        }), e.code

    @app.errorhandler(Exception)
    def handle_generic_exception(e):
        # In development, you can print/log the exception
        app.logger.error(f"Server Error: {str(e)}", exc_info=True)
        return jsonify({
            "success": False,
            "message": "Internal Server Error"
        }), 500
