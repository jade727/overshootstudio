<?php

namespace Application\models;

use Application\abstracts\RequestImageSetAbstract;

class RequestImageSet extends RequestImageSetAbstract
{
    protected $CONNECTION;

    public $images;

    public function __construct($userData = [])
    {
        global $CONNECTION;

        $this->CONNECTION = $CONNECTION;
        $this->applyData($userData, RequestImageSetAbstract::class);
        $this->init();
    }

    private function init(): void
    {
        global $APPLICATION;

        $this->images = [];

        $this->images = $APPLICATION->FUNCTIONS->RESULT_IMAGE_CONTROL->filterRecords(['reference' => $this->reference], true);
    }
}