# modules/storage/output.tf

output "bucket_id" {
  description = "The OCID of the created bucket"
  value       = oci_objectstorage_bucket.bucket.id
}

output "bucket_name" {
  description = "The name of the created bucket"
  value       = oci_objectstorage_bucket.bucket.name
}

output "bucket_namespace" {
  description = "The namespace of the bucket"
  value       = data.oci_objectstorage_namespace.ns.namespace
}

output "bucket_access_type" {
  description = "The access type set for the bucket"
  value       = oci_objectstorage_bucket.bucket.access_type
}

output "bucket_etag" {
  description = "The entity tag for the bucket"
  value       = oci_objectstorage_bucket.bucket.etag
}

output "bucket_approximate_count" {
  description = "The approximate number of objects in the bucket"
  value       = oci_objectstorage_bucket.bucket.approximate_count
}

output "bucket_approximate_size" {
  description = "The approximate size of the bucket"
  value       = oci_objectstorage_bucket.bucket.approximate_size
}

output "object_lifecycle_policy_id" {
  description = "The ID of the bucket lifecycle policy"
  value       = length(var.lifecycle_rules) > 0 ? oci_objectstorage_object_lifecycle_policy.bucket_lifecycle_policy[0].id : null
}

output "bucket_url" {
  description = "The URL to access the bucket"
  value       = "https://objectstorage.${var.region}.oraclecloud.com/n/${data.oci_objectstorage_namespace.ns.namespace}/b/${oci_objectstorage_bucket.bucket.name}/o"
}
