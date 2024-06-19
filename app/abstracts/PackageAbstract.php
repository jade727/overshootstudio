<?php

namespace Application\abstracts;

abstract class PackageAbstract extends ModelDefaultFunctions
{
    public $package_id;

    public $name;

    public $price;

    public $image;

    public $db_status;


    public $date_created;
}