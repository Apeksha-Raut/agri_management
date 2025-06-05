// Define calendar view settings for the "Fertilizer Event" doctype in Frappe
frappe.views.calendar["Fertilizer Event"] = {
  // Map the fields in the doctype to calendar event properties
  field_map: {
    start: "suggested_date", // Use the "suggested_date" field as the event start date
    end: "suggested_date", // Use the same "suggested_date" for event end date (single day event)
    id: "name",
    title: "fertilizer_name", // Use the "fertilizer_name" field to show event title on calendar
    allDay: 1,
  },
};
