# Copyright (c) 2025, Apeksha Raut and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document


class PlantationMaster(Document):
	pass


# This function is used to create or update Fertilizer Event records
@frappe.whitelist()
def create_fertilizer_events(plantation):
    """
    Create or update Fertilizer Event records based on the Fertilizer Plan
    child table in Plantation Master.
    """
    try:
        doc = frappe.get_doc("Plantation Master", plantation)
    except frappe.DoesNotExistError:
        frappe.throw(f"Plantation Master '{plantation}' does not exist.")

    created = False
    updated = False

    for row in doc.fertilizer_plan:
        try:
            existing_name = get_existing_fertilizer_event(doc.name, row)
            if existing_name:
                update_fertilizer_event(existing_name, doc, row)
                updated = True
            else:
                create_fertilizer_event(doc, row)
                created = True
        except Exception as e:
            frappe.log_error(message=str(e), title="Error in create_fertilizer_events")
            # Continue processing other rows even if one fails

    if created and updated:
        return "created_and_updated"
    elif created:
        return "created"
    elif updated:
        return "updated"
    else:
        return "no_change"


# This function checks for an existing Fertilizer Event based on plantation, fertilizer, and days.
def get_existing_fertilizer_event(plantation_name, fertilizer_row):
    """
    Returns the name of existing Fertilizer Event matching the plantation, fertilizer, and days.
    """
    return frappe.db.get_value(
        "Fertilizer Event",
        {
            "plantation": plantation_name,
            "fertilizer_name": fertilizer_row.fertilizer_name,
            "days": fertilizer_row.days,
        },
        "name",
    )

# This function updates an existing Fertilizer Event.
def update_fertilizer_event(event_name, plantation_doc, fertilizer_row):
    """
    Update the existing Fertilizer Event with new data from fertilizer_row.
    """
    event = frappe.get_doc("Fertilizer Event", event_name)
    event.update({
        "plantation": plantation_doc.name,
        "fertilizer_name": fertilizer_row.fertilizer_name,
        "days": fertilizer_row.days,
        "suggested_date": fertilizer_row.suggested_date,
        "dose": fertilizer_row.dose,
        "quantity": fertilizer_row.quantity,
        "units_of_measure": fertilizer_row.units_of_measure,
    })
    event.save(ignore_permissions=True)

# This function creates a new Fertilizer Event record.
def create_fertilizer_event(plantation_doc, fertilizer_row):
    """
    Create a new Fertilizer Event record based on fertilizer_row.
    """
    event = frappe.get_doc({
        "doctype": "Fertilizer Event",
        "plantation": plantation_doc.name,
        "days": fertilizer_row.days,
        "suggested_date": fertilizer_row.suggested_date,
        "dose": fertilizer_row.dose,
        "fertilizer_name": fertilizer_row.fertilizer_name,
        "quantity": fertilizer_row.quantity,
        "units_of_measure": fertilizer_row.units_of_measure,
    })
    event.insert(ignore_permissions=True)
