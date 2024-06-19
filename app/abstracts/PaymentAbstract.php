<?php

namespace Application\abstracts;

abstract class PaymentAbstract extends ModelDefaultFunctions
{
    public $payment_id;

    public $user_id;

    public $topay;

    public $number;

    public $reference;

    public $image;
    public $sender_number;
    public $sent_amount;

    public $note;

    public $status;

    public $db_status;

    public $date_created;
}