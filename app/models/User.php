<?php


namespace Application\models;

use Application\abstracts\UserAbstract;

class User extends UserAbstract
{
    protected $CONNECTION;

    public $displayName;

    public $photoURL;

    public $typeName;

    public function __construct($userData = [])
    {
        global $CONNECTION;

        $this->CONNECTION = $CONNECTION;
        $this->applyData($userData, UserAbstract::class);
        $this->init();
    }

    private function init(): void
    {
        global $USER_TYPES_TEXT;

        $EXTENSION = 'jpg';
        $CHARACTER_AVATAR_PATH = 'public/assets/media/images/avatar/character/';

        $this->displayName = $this->firstname . ' ' . $this->lastname;

        $this->photoURL = $CHARACTER_AVATAR_PATH . strtoupper($this->displayName[0]) . '.' . $EXTENSION;
        $this->typeName = $USER_TYPES_TEXT[$this->user_type];
    }

    public function isType($type)
    {
        return $type == $this->user_type;
    }
}