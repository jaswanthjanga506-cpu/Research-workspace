from flask import jsonify

def success_response(data=None, message="Success", status=200):
    response = {"success": True, "message": message}
    if data is not None:
        response["data"] = data
    return jsonify(response), status

def error_response(message="Error", status=400, errors=None):
    response = {"success": False, "message": message}
    if errors is not None:
        response["errors"] = errors
    return jsonify(response), status
