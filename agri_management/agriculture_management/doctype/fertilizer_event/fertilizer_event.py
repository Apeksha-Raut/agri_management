# Copyright (c) 2025, Apeksha Raut and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

from frappe.desk.calendar import get_events
import json

from frappe.utils import getdate

class FertilizerEvent(Document):
	pass

@frappe.whitelist()
def get_fertilizer_events(doctype, start, end, filters=None, field_map=None):
    # Parse filters safely
    if isinstance(filters, str):
        filters = frappe.parse_json(filters)

    # Ensure filters is a dictionary
    if not filters or isinstance(filters, list):
        filters = {}

    start_date = getdate(start)
    end_date = getdate(end)

    # Apply date filter
    filters["suggested_date"] = ["between", [start_date, end_date]]

    # Return events manually
    events = frappe.get_all(
        doctype,
        fields=[
            "name as id",
            "suggested_date as start",
            "suggested_date as end",
            "fertilizer_name as title",
            "dose as status"
        ],
        filters=filters,
        order_by="suggested_date asc"
    )

    return events