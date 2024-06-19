<?php

namespace Application\controllers\system;

use Application\abstracts\ControlDefaultFunctions;
use Application\models\RequestImageSet;

class RequestImageSetControl extends ControlDefaultFunctions
{
    protected $MODEL_CLASS = RequestImageSet::class;
    protected $TABLE_NAME = "request_image_sets";
    protected $TABLE_PRIMARY_ID = "set_id";
    protected $SEARCH_LOOKUP = [];


}