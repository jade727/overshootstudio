<?php

namespace Application\controllers\system;

use Application\abstracts\ControlDefaultFunctions;
use Application\models\ResultImage;

class ResultImageControl extends ControlDefaultFunctions
{
    protected $MODEL_CLASS = ResultImage::class;
    protected $TABLE_NAME = "result_images";
    protected $TABLE_PRIMARY_ID = "image_id";
    protected $SEARCH_LOOKUP = [];
}