<?php

namespace Application\abstracts;

abstract class InventoryItemAbstract extends ModelDefaultFunctions
{
    public $item_id;

    public $name;

    public $category;

    public $stocks;

    public $color;

    public $size;

    public $description;

    public $item_status;

    public $db_status;

    public $status_description;

    public $person_involved;

    public $quantity_involved;

    public $date_involved;

    public $date_created;
}