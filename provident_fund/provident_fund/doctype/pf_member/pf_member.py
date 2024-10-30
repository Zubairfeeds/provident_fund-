# Copyright (c) 2024, Atom Global and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document

class PFMember(Document):
	pass
class PFMember(Document):
    def before_save(self):
        self.full_name = f"{self.first_name or ''} {self.middle_name or '' } {self.last_name or ''}"
