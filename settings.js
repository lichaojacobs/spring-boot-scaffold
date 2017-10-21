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
            "  common:",
            "    userName: root",
            "    password: root",
            "    decrypt: false",
            "    masterUrl: jdbc:mysql://localhost:3306/test?useUnicode=true&characterEncoding=utf8&autoReconnect=true&failOverReadOnly=false"
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
            "  name: Common",
            "  connection: localhost:6379",
            "  password: root"
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
            "  servers: localhost:9092",
            "  groupID: localhost:6379",
            "  maxPollRecords: 1000"
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
            "  common:",
            "    userName: admin",
            "    password: KYLIN",
            "    decrypt: false",
            "    connectionUrl: jdbc:kylin://localhost:7070/common"
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
