// Copyright (c) 2025, Apeksha Raut and contributors
// For license information, please see license.txt

frappe.ui.form.on("Plantation Master", {
  refresh(frm) {
    if (!frm.is_new()) {
      // Add custom button to generate fertilizer event records
      frm.add_custom_button("Generate Fertilizer Events", () => {
        generate_fertilizer_events(frm);
      });
    }
  },

  // Triggered when the crop master is selected
  crop_master(frm) {
    if (frm.doc.crop_master) {
      fetch_and_populate_fertilizer_plan(frm);
    }
  },

  // Triggered when the plantation date is set or changed
  plantation_date(frm) {
    update_suggested_dates(frm);
  },

  // If the plantation date is set or change, udpate the suggested dates in the fertilizer plan
  // and update fertilizer event records also
  after_save(frm) {
    // Automatically generate fertilizer events after saving the plantation
    if (!frm.is_new()) {
      generate_fertilizer_events(frm);
    }
  },
});

// Function to generate fertilizer events for the plantation
function generate_fertilizer_events(frm) {
  frappe.call({
    method:
      "agri_management.agriculture_management.doctype.plantation_master.plantation_master.create_fertilizer_events",
    args: { plantation: frm.doc.name },
    freeze: true,
    callback(r) {
      if (!r.exc) {
        let status = r.message;

        let messages = {
          created: {
            title: "Fertilizer Events Created",
            message: "New fertilizer events have been created.",
            indicator: "green",
          },
          updated: {
            title: "Fertilizer Events Updated",
            message: "Existing fertilizer events have been updated.",
            indicator: "blue",
          },
          created_and_updated: {
            title: "Fertilizer Events Created & Updated",
            message: "Some events were created and others updated.",
            indicator: "green",
          },
          no_change: {
            title: "No Changes",
            message: "No changes were made to fertilizer events.",
            indicator: "orange",
          },
        };

        frappe.msgprint(messages[status]);
      }
    },
  });
}

// Function to fetch fertilizer suggestions from the Crop Master and populate the fertilizer plan
function fetch_and_populate_fertilizer_plan(frm) {
  frappe.call({
    method: "frappe.client.get",
    args: {
      doctype: "Crop Master",
      name: frm.doc.crop_master,
    },
    callback(r) {
      if (r.message) {
        frm.clear_table("fertilizer_plan");
        (r.message.fertilizer_suggestion || []).forEach((row) => {
          let child = frm.add_child("fertilizer_plan");
          child.dose = row.dose;
          child.days = row.days;
          child.fertilizer_name = row.fertilizer_name;
          child.quantity = row.quantity;
          child.units_of_measure = row.units_of_measure;

          if (frm.doc.plantation_date) {
            child.suggested_date = calculate_suggested_date(
              frm.doc.plantation_date,
              row.days
            );
          }
        });
        frm.refresh_field("fertilizer_plan");
      }
    },
  });
}

// Function to update suggested dates in the fertilizer plan based on plantation date and days
function update_suggested_dates(frm) {
  if (!frm.doc.fertilizer_plan) return;

  frm.doc.fertilizer_plan.forEach((row) => {
    if (row.days && frm.doc.plantation_date) {
      row.suggested_date = calculate_suggested_date(
        frm.doc.plantation_date,
        row.days
      );
    }
  });

  frm.refresh_field("fertilizer_plan");
}

// Function to calculate the suggested date based on plantation date and days
function calculate_suggested_date(plantation_date, days) {
  let date_obj = frappe.datetime.str_to_obj(plantation_date);
  let new_date = frappe.datetime.add_days(date_obj, days);
  return frappe.datetime.obj_to_str(new_date);
}
