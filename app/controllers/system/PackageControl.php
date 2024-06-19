<?php

namespace Application\controllers\system;

use Application\abstracts\ControlDefaultFunctions;
use Application\models\Package;
use Application\models\User;

class PackageControl extends ControlDefaultFunctions
{
    protected $MODEL_CLASS = Package::class;
    protected $TABLE_NAME = "packages";
    protected $TABLE_PRIMARY_ID = "package_id";
    protected $SEARCH_LOOKUP = [];
}