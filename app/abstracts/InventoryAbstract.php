<?php

namespace Application\abstracts;

abstract class InventoryAbstract extends ModelDefaultFunctions
{
    public $inventory_id;

    public $user_id;

    public $inventory_date;

    public $db_status;

    public $date_created;
}