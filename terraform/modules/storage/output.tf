# modules/storage/outputs.tf
output "bucket_name" {
  description = "The name of the bucket"
  value       = oci_objectstorage_bucket.bucket.name
}

output "bucket_namespace" {
  description = "The Object Storage namespace"
  value       = data.oci_objectstorage_namespace.ns.namespace
}

output "bucket_id" {
  description = "The OCID of the bucket"
  value       = oci_objectstorage_bucket.bucket.id
}
