<?php

namespace Application\abstracts;

abstract class RequestAbstract extends ModelDefaultFunctions
{
    public $request_id;

    public $user_id;

    public $package_id;

    public $package_price;

    public $payment_id;

    public $schedule;

    public $note;

    public $status;

    public $db_status;


    public $date_created;

}