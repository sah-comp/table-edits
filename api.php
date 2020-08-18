<?php
foreach ($_POST as $key => $value) {
    error_log($key . ' = ' . $value);
}
