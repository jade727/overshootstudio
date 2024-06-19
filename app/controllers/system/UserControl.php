<?php

namespace Application\controllers\system;

use Application\abstracts\ControlDefaultFunctions;
use Application\controllers\app\Response;
use Application\models\User;
use TABLE_TYPE;

class UserControl extends ControlDefaultFunctions
{
    protected $MODEL_CLASS = User::class;
    protected $TABLE_NAME = "users";
    protected $TABLE_PRIMARY_ID = "user_id";
    protected $SEARCH_LOOKUP = [];

    public function generateNewCredential($firstname, $lastname, $email)
    {
        $record = [
            'firstname' => $firstname,
            'lastname' => $lastname,
            'email_address' => $email,
            'username' => $this->random_username($firstname . ' ' . $lastname),
            'password' => md5(strtolower($lastname) . '@123456'),
            'user_type' => 1
        ];

        return $this->addRecord($record);
    }

    public function add($data)
    {
        $usernameExists = $this->isUsernameExist($data['username']);

        if ($usernameExists) {
            return new Response(400, "Username Already Exists");
        }

        $data['password'] = md5($data['password']);

        return $this->addRecord($data);
    }

    public function edit($id, $data)
    {
        $user = $this->get($id, false);

        if ($user['username'] != $data['username']) {
            $usernameExists = $this->isUsernameExist($data['username']);

            if ($usernameExists) {
                return new Response(400, "Username Already Exists");
            }
        }

        return  $this->editRecord($id, $data);
    }

    function updateDBStatus($type, $primary, $ids)
    {
        global $APPLICATION;

        switch ($type) {
            case TABLE_TYPE::ACCOUNTS->value:
                $control = $APPLICATION->FUNCTIONS->USER_CONTROL;
                break;
            case TABLE_TYPE::PACKAGES->value:
                $control = $APPLICATION->FUNCTIONS->PACKAGE_CONTROL;
                break;
            case TABLE_TYPE::INVENTORY_ITEM->value:
                $control = $APPLICATION->FUNCTIONS->INVENTORY_CONTROL;
                break;
            case TABLE_TYPE::WALKIN_REQUEST->value:
                $control = $APPLICATION->FUNCTIONS->WALKIN_CONTROL;
                break;
        }

        foreach ($ids as $__ID) {
             $control->editRecord($__ID, ["db_status" => \DB_STATUS::ACTIVE->value]);
        }

        return new Response(200, "Succeessfully edited");
    }

    function updatePassword($data)
    {
        global $SESSION;

        $old = $data['old_password'];
        $new = $data['new_password'];

        $user = $this->get($SESSION->user_id, false);

        if (md5($old) != $user['password']) {
            return new Response(400, "Old Password is Wrong");
        }

        return $this->editRecord($SESSION->user_id, ["password" => md5($new)]);
    }

    function random_username($string) {
        return preg_replace('/(\S+) (\S{2}).*/', '$1$2', strtolower($string)) . random_int(0, 100);
    }

    private function isUsernameExist($username)
    {
        return count($this->filterRecords(['username' => $username], false)) > 0;
    }

}