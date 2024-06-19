<?php

namespace Application\controllers\system;

use Application\abstracts\ControlDefaultFunctions;
use Application\models\WalkIn;

class WalkInControl extends ControlDefaultFunctions
{
    protected $MODEL_CLASS = WalkIn::class;
    protected $TABLE_NAME = "walkin";
    protected $TABLE_PRIMARY_ID = "walkin_id";
    protected $SEARCH_LOOKUP = [];

    public function add($record) {
        global $APPLICATION;

        $control = $APPLICATION->FUNCTIONS->USER_CONTROL;

        if (!empty($record)) {

            $user = $control->generateNewCredential($record['firstname'], $record['lastname'], $record['email_address']);

            if ($user->code === 200) {
                $record['user_id'] = $user->body['id'];

                unset($record['firstname'], $record['lastname'], $record['email_address']);
            }
        }

        $res =  $this->addRecord($record);

        if ($res->code === 200) {
            $res->body['user_id'] = $record['user_id'];
        }
        return $res;
    }
}