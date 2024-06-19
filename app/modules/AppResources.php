<?php

// ALL FINANCIAL

// OTHERS

use Application\controllers\system\InventoryItemControl;
use Application\controllers\system\PackageControl;
use Application\controllers\system\UserControl;

$GENDERS = ["Male", "Female"];

$USER_TYPES_TEXT = [false, "User", "Admin"];

$REQUEST_STATUS = [false, "Pending", "Accepted", "Declined", "Cancelled", "Completed"];



$REQUESTS_TABLE_HEADER_TEXT = ["NO", "SCHEDULE", "PACKAGE", "PRICE", "PAYMENT", "STATUS"];
$REQUESTS_TABLE_BODY_TEXT = ["no", "schedule", [
    "primary" => "package_id",
    "controller" => PackageControl::class,
    "value" => "name"
], [
    "primary" => "package_id",
    "controller" => PackageControl::class,
    "value" => "price"
], "payment_id", [
    "value" => "status",
    "array" => $REQUEST_STATUS
]];

$PACKAGES_TABLE_HEADER_TEXT = ["NO", "NAME", "PRICE",  "DATE CREATED"];
$PACKAGES_TABLE_BODY_TEXT = ["no", "name", "price",  "date_created"];

$WALKIN_TABLE_HEADER_TEXT = ["NO", "NAME", "SCHEDULE",  "PACKAGE", "PRICE", "DOWN PAYMENT","BALANCE", "STATUS"];
$WALKIN_TABLE_BODY_TEXT = ["no", [
    "primary" => "user_id",
    "controller" => UserControl::class,
    "value" => "displayName"
], "schedule",  [
    "primary" => "package_id",
    "controller" => PackageControl::class,
    "value" => "name"
], [
    "primary" => "package_id",
    "controller" => PackageControl::class,
    "value" => "price"
], "down_payment","balance", "status"];

$INVENTORY_TABLE_HEADER_TEXT = ["NO", "NAME", "CATEGORY",  "STOCKS", "COLOR", "SIZE", "DESCRIPTION", "ITEM STATUS"];
$INVENTORY_TABLE_BODY_TEXT = ["no", "name", "category",  "stocks", "color", "size", "description", "item_status"];

$INVENTORY_REPORT_TABLE_HEADER_TEXT = ["NO", "NAME", "CATEGORY",  "STOCKS", "COLOR", "SIZE", "ITEM STATUS", "PERSON", "QTY INV", "DATE", "NOTE"];
$INVENTORY_REPORT_TABLE_BODY_TEXT = ["no", [
    "primary" => "item_id",
    "controller" => InventoryItemControl::class,
    "value" => "name"
], [
    "primary" => "item_id",
    "controller" => InventoryItemControl::class,
    "value" => "category"
],  "quantity", [
    "primary" => "item_id",
    "controller" => InventoryItemControl::class,
    "value" => "color"
], [
    "primary" => "item_id",
    "controller" => InventoryItemControl::class,
    "value" => "size"
], "item_status", "person_involved", "quantity_involved", "date_involved", "status_description"];

$INVENTORY_RECORD_TABLE_HEADER_TEXT = ["NO", "USER", "DATE OF INVENTORY", "DESCRIPTION",  "DATE MODIFIED"];
$INVENTORY_RECORD_TABLE_BODY_TEXT = ["no", [
    "primary" => "user_id",
    "controller" => UserControl::class,
    "value" => "displayName"
], "inventory_date","description" , "date_created"];

$USER_TABLE_HEADER_TEXT = ["NO", "NAME", "USERNAME",  "MOBILE", "GENDER"];
$USER_TABLE_BODY_TEXT = ["no", [
    "primary" => "user_id",
    "controller" => UserControl::class,
    "value" => "displayName"
], "username",  "mobile", "gender"];

$ALL_ITEM_STATUS = array_column(ItemStatus::cases(), 'name');

$ALL_TABLE_TYPE = array_column(TABLE_TYPE::cases(), 'name');

$ALL_TABLE_TYPE_VALUES = array_column(TABLE_TYPE::cases(), 'value');
