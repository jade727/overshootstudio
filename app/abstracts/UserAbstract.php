<?php

namespace Application\abstracts;

abstract class UserAbstract extends ModelDefaultFunctions
{
    public $user_id;

    public $username;

    public $password;

    public $firstname;

    public $lastname;

    public $user_type;

    public $mobile;

    public $gender;
    public $email_address;

    public $db_status;


    public $date_created;
}