import json
from typing import List

from uime import ui_enabled, start_server, ui_global

DEFAULT = "There are no accidents."
DEFAULT_2 = "Only coincidences."


@ui_global(name="DEFAULT", description="Global DEFAULT value", default_value=DEFAULT)
def set_default(value):
    global DEFAULT
    DEFAULT = value


@ui_global(name="DEFAULT_2", description="Global DEFAULT_2 value", default_value=DEFAULT_2)
def set_default2(value):
    global DEFAULT_2
    DEFAULT_2 = value


@ui_enabled(group="group1")
def hello_world(name, value: bool = True):
    return f"Hello {name}. {DEFAULT} {DEFAULT_2} | {value}"


@ui_enabled(group="group1", title="My API", description="This will return a json")
def make_api_call(url, data="Some default value"):
    return json.dumps({"url": url, "data": hello_world(data)})

@ui_enabled(group="group1", title="My API2", description="This will return a json")
def make_api_call2(url, data="Some default value"):
    return json.dumps({"url": url, "data": hello_world(data)})

@ui_enabled(group="group1", description="This will return a json")
def make_api_call3(url, data="Some default value"):
    return json.dumps({"url": url, "data": hello_world(data)})

@ui_enabled(group="group1", description="This will return a json")
def make_api_call4(url, data="Some default value"):
    return json.dumps({"url": url, "data": hello_world(data)})

@ui_enabled(group="group1", description="This will return a json")
def make_api_call5(url, data="Some default value"):
    return json.dumps({"url": url, "data": hello_world(data)})

@ui_enabled(group="group1", description="This will return a json")
def make_api_call6(url, data="Some default value"):
    return json.dumps({"url": url, "data": hello_world(data)})

@ui_enabled(group="group1", description="This will return a json")
def make_api_call7(url, data="Some default value"):
    return json.dumps({"url": url, "data": hello_world(data)})

@ui_enabled(group="group1", description="This will return a json")
def make_api_call8(url, data="Some default value"):
    return json.dumps({"url": url, "data": hello_world(data)})

@ui_enabled(group="group1", description="This will return a json")
def make_api_call9(url, data="Some default value"):
    return json.dumps({"url": url, "data": hello_world(data)})

@ui_enabled(group="group1", description="This will return a json")
def make_api_call10(url, data="Some default value"):
    return json.dumps({"url": url, "data": hello_world(data)})


@ui_enabled(group="group2")
def sum_math_function(a: int, b: int):
    return a + b


@ui_enabled(group="group2")
def difference_math_function(a: int, b: int = 22):
    print(type(b))
    return a - b


@ui_enabled(group="group1")
def test_list_string(regular_list: list,
                     bool_data: bool,
                     strings: List[str], ints: List[int], dicts: dict, list_of_list: List[list],
                     list_with_default:list = "more,default"):
    return f"""
    list = {regular_list},
    bool_data: {bool_data}
    strings= {strings}
    ints= {ints}
    dicts: {json.dumps(dicts)}
    list_of_list: {list_of_list},
    list_with_default: {list_with_default}
    """


@ui_enabled(group="group1")
def large_string():
    return "{\"error\": \"Error in making api call\nurl: https://olympus-im-stage.phonepe.com/olympus/im/v1/users/emails/tushar.naik@phonepe.com status code: 401, method: get, response:{\"code\":\"INVALID_TOKEN\",\"errorCode\":\"OIM004\",\"message\":\"Unauthorized: Token data is either not available or empty, trackingId: 8f279ae69dd250bb\",\"context\":{\"message\":\"org.jose4j.jwt.consumer.InvalidJwtException: JWT (claims->{\\\"sub\\\":\\\"olympusim_OU2207181546348810000537\\\",\\\"iat\\\":1703913724,\\\"iss\\\":\\\"olympusIM\\\",\\\"role\\\":\\\"olympusTest\\\",\\\"key_id\\\":\\\"olympusim\\\",\\\"roles\\\":[\\\"olympusTest\\\"],\\\"type\\\":\\\"dynamic\\\",\\\"version\\\":\\\"4.0\\\",\\\"userDetails\\\":{\\\"userId\\\":\\\"OU2207181546348810000537\\\",\\\"userType\\\":\\\"HUMAN\\\",\\\"organisationId\\\":\\\"PHONEPE\\\",\\\"belongsToTeamId\\\":\\\"phonepe:infra\\\",\\\"email\\\":\\\"tushar.naik@phonepe.com\\\"},\\\"sid\\\":\\\"e6cef731-568c-4964-aa7a-49d9494fcfb7\\\",\\\"validationData\\\":{},\\\"aud\\\":\\\"olympusim\\\",\\\"sessionExpiry\\\":1704518524,\\\"user_id\\\":\\\"olympusim_OU2207181546348810000537\\\",\\\"name\\\":\\\"OU2207181546348810000537\\\",\\\"id\\\":\\\"olympusim_OU2207181546348810000537\\\",\\\"client_version\\\":1,\\\"exp\\\":1704518524}) rejected due to invalid claims or other invalid content. Additional details: [[1] The JWT is no longer valid - the evaluation time NumericDate{1705056973 -> Jan 12, 2024, 4:26:13 PM IST} is on or after the Expiration Time (exp=NumericDate{1704518524 -> Jan 6, 2024, 10:52:04 AM IST}) claim value (even when providing 60 seconds of leeway to account for clock skew).]\"}} requestBody:None\"}"


if __name__ == '__main__':
    start_server(port=5001)
