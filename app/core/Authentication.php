<?php

namespace Application\core;

use Application\controllers\app\Response;

class Authentication
{
//    public function login($username, $password, $type) {
//        global $APPLICATION;
//
//        $control = $APPLICATION->FUNCTIONS->USER_CONTROL;
//
//        $login = $control->alreadyExists(["username" => $username, "password" => $password, "type" => $type]);
//
//    }

    protected $CONNECTION;
    /**
     * @type Connection
     */
    protected $APPLICATION;
    /**
     * @type Session
     */
    protected $SESSION;

    public function __construct()
    {
        global $CONNECTION;
        global $APPLICATION;
        global $SESSION;


        $this->CONNECTION = $CONNECTION;
        $this->APPLICATION = $APPLICATION;
        $this->SESSION = $SESSION;
    }

    public function Register($data, $userType)
    {
        global $REQUEST_TYPE;

        if (empty($data)) {
            return new Response(205, "Information must be filled");
        }

//        if (!filter_var($data["email"], FILTER_VALIDATE_EMAIL)) {
//            return new Response(203, "Please enter a valid email address", ["errors" => ["email"]]);
//        }

//        if ($data["password"] !== $data["confirm-password"]) {
//            return new Response(203, "Password is not matched!", ["errors" => ["confirm-password"]]);
//        }

//        if ($this->EmailExist($data["email"])) {
//            return new Response(203, "Email is already exist!", ["errors" => ["email"]]);
//        }

        if ($this->UsernameExist($data["username"])) {
            return new Response(203, "Username is already exist!", ["errors" => ["username"]]);
        }

        $data["password"] = md5($data["password"]);

        $data["user_type"] = $userType;

//        unset($data["confirm-password"]);

        $register = $this->CONNECTION->Insert("users", $data, true);

        return new Response($register ? 200 : 204, $register ? "Successfully Registered" : "Registration Failed!", ["user_id" => $register]);
    }

    public function EmailExist($email, $asAdmin = false)
    {
        return $this->CONNECTION->Exist("users", ["email" => $email]);
    }

    private function UsernameExist($username)
    {
        return $this->CONNECTION->Exist("users", ["username" => $username]);
    }

    public function LoginSession($email, $password, $userType, $verification = "")
    {
        $login = $this->Login($email, $password, $userType);

        if ($login->code === 200) {
            $user = $login->body["user"];
            $this->SESSION->apply($user, $userType !== 1);
            $this->SESSION->start();
        }

        return $login;
    }

    public function Login($username, $password, $userType)
    {
        global $APPLICATION;

        $user = null;
        $errors = [];

        $findUser = $this->CONNECTION->Exist("users", ["username" => $username, "password" => md5($password), "user_type" => $userType], "user_id");
        $findusername = $this->CONNECTION->Exist("users", ["username" => $username, "user_type" => $userType], "user_id");

        if ($findUser > 0) {
            $user = $APPLICATION->FUNCTIONS->USER_CONTROL->get($findUser, true);
        } else {

            if (!$findusername) {
                array_push($errors, 'username');
            }
            array_push($errors, 'password');
        }

        return new Response($findUser ? 200 : 203, $findUser ? "Successfully Login" : "Login Failed", ["user" => $user, "errors" => $errors]);
    }
}