# modules/storage/main.tf
resource "oci_objectstorage_bucket" "bucket" {
  compartment_id = var.compartment_id
  name           = var.bucket_name
  namespace      = data.oci_objectstorage_namespace.ns.namespace
  access_type    = var.bucket_access_type
  versioning     = var.versioning
  storage_tier   = var.storage_tier
}

# Get the Object Storage namespace
data "oci_objectstorage_namespace" "ns" {
  compartment_id = var.compartment_id
}
