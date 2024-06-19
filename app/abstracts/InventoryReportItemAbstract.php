<?php

namespace Application\abstracts;

abstract class InventoryReportItemAbstract extends ModelDefaultFunctions
{
    public $inventory_item_id;

    public $inventory_id;

    public $item_id;
    public $quantity;

    public $item_status;

    public $db_status;

    public $status_description;

    public $person_involved;

    public $quantity_involved;

    public $date_involved;

    public $date_created;
}