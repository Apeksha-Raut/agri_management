# Copyright (c) 2025, Apeksha Raut and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document


class PlantationMaster(Document):
	pass


@frappe.whitelist()
def create_fertilizer_events(plantation):
    """
    This function creates Fertilizer Event records based on the Fertilizer Plan
    child table in Plantation Master.
    """
    doc = frappe.get_doc("Plantation Master", plantation)

    # Optional: Delete old events before recreating
    frappe.db.delete("Fertilizer Event", {"plantation": plantation})


    for row in doc.fertilizer_plan:
        # Create new Fertilizer Event doc
        event = frappe.get_doc({
            "doctype": "Fertilizer Event",
            "title": f"Dose {row.dose} - {row.fertilizer_name} ({doc.farmer_name})",
            "plantation": doc.name,
            "days": row.days,
            "suggested_date": row.suggested_date,
            "dose": row.dose,
            "fertilizer_name": row.fertilizer_name,
            "quantity": row.quantity,
            "units_of_measure": row.units_of_measure,
        })
        event.insert(ignore_permissions=True)

    return "Fertilizer Events Created"

