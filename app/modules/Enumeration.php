
<?php


enum UserAuthenticationTypes : string {
    case NO_AUTHENTICATION = "NO_AUTHENTICATION";
    case USERNAME_PASSWORD = "USERNAME_PASSWORD";
    case PIN_AUTHENTICATION = "PIN_AUTHENTICATION";
    case EMAIL_AUTHENTICATION = "EMAIL_AUTHENTICATION";
}


enum ItemStatus : int {
    case NORMAL  = 1;

    case DAMAGED = 2;

    case BORROWED = 3;

    case LOST = 4;
}

enum DB_STATUS : int {
    case ACTIVE  = 1;

    case INACTIVE = 2;

    case REMOVED = 3;
}

enum TABLE_TYPE : int {
    case ACCOUNTS  = 1;

    case PACKAGES = 2;

    case INVENTORY_ITEM = 3;

    case WALKIN_REQUEST = 4;
}
?>


