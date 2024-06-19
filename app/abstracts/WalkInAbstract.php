<?php

namespace Application\abstracts;

abstract class WalkInAbstract extends ModelDefaultFunctions
{
    public $walkin_id;

    public $user_id;

    public $package_id;

    public $package_price;

    public $down_payment;

    public $balance;

    public $schedule;

    public $description;
    
    public $book_status;

    public $status;

    public $db_status;

    public $date_created;
}