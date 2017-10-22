exports.dependencies = {
    'common-data-starter-jdbc': {
        "dependency": [
            "<dependency>",
            "  <groupId>com.mobvoi.data</groupId>",
            "  <artifactId>common-data-starter-jdbc</artifactId>",
            "</dependency>"
        ],
        "settings": [
            "mysql:",
            "  {0}:",
            "    userName: {0}",
            "    password: {0}",
            "    decrypt: false",
            "    masterUrl: {0}"
        ]
    },
    'common-data-starter-cache': {
        "dependency": [
            "<dependency>",
            "  <groupId>com.mobvoi.data</groupId>",
            "  <artifactId>common-data-starter-cache</artifactId>",
            "</dependency>"
        ],
        "settings": [
            "redis:",
            "  name: {0}",
            "  connection: {0}",
            "  password: {0}",
        ]
    },
    'common-data-starter-kafka': {
        "dependency": [
            "<dependency>",
            "  <groupId>com.mobvoi.data</groupId>",
            "  <artifactId>common-data-starter-kafka</artifactId>",
            "</dependency>"
        ],
        "settings": [
            "kafka:",
            "  servers: {0}",
            "  groupID: {0}",
            "  maxPollRecords: {0}"
        ]
    },
    'common-data-starter-kylin-jdbc': {
        "dependency": [
            "<dependency>",
            "  <groupId>com.mobvoi.data</groupId>",
            "  <artifactId>common-data-starter-kylin-jdbc</artifactId>",
            "</dependency>"
        ],
        "settings": [
            "kylin:",
            "  {0}:",
            "    userName: {0}",
            "    password: {0}",
            "    decrypt: false",
            "    connectionUrl: {0}"
        ]
    },
    'common-data-starter-utils': {
        "dependency": [
            "<dependency>",
            "  <groupId>com.mobvoi.data</groupId>",
            "  <artifactId>common-data-starter-utils</artifactId>",
            "</dependency>"
        ],
        "settings": []
    }
}

exports.defaultSettings = {
    'common-data-starter-jdbc': {
        "dataSourceName": "common",
        "userName": "root",
        "password": "root",
        "masterUrl": "jdbc:mysql://localhost:3306/test?useUnicode=true&characterEncoding=utf8&autoReconnect=true&failOverReadOnly=false"
    },
    'common-data-starter-cache': {
        "name": "common",
        "connection": "localhost:6379",
        "password": "root"
    },
    'common-data-starter-kafka': {
        "servers": "localhost:9092",
        "groupID": "default-consumer-group",
        "maxPollRecords": 1000
    },
    'common-data-starter-kylin-jdbc': {
        "ProjectName": "common",
        "userName": "admin",
        "password": "KYLIN",
        "connectionUrl": "jdbc:kylin://localhost:7070/common"
    }
}
