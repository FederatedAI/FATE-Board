package org.fedai.fate.board.services;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.github.benmanes.caffeine.cache.Cache;
import org.apache.curator.framework.CuratorFramework;
import org.apache.curator.framework.CuratorFrameworkFactory;
import org.apache.curator.framework.recipes.cache.*;
import org.apache.curator.framework.state.ConnectionState;
import org.apache.curator.framework.state.ConnectionStateListener;
import org.apache.curator.retry.RetryNTimes;
import org.apache.zookeeper.ZooDefs;
import org.apache.zookeeper.data.ACL;
import org.apache.zookeeper.data.Id;
import org.apache.zookeeper.server.auth.DigestAuthenticationProvider;
import org.fedai.fate.board.global.Dict;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import javax.annotation.PostConstruct;
import javax.annotation.Resource;
import java.nio.charset.Charset;
import java.util.*;

@Component
public class FlowHighAvailableService {

    private final Logger logger = LoggerFactory.getLogger(FlowHighAvailableService.class);

    @Value("${zookeeper.url_list}")
    private String urls;
    @Value("${zookeeper.time_out}")
    private int timeout;
    @Value("${zookeeper.acl_enable}")
    private boolean aclEnable;
    @Value("${zookeeper.acl_username}")
    private String aclUsername;
    @Value("${zookeeper.acl_password}")
    private String aclPassword;
    @Value("${zookeeper.scheme}")
    private String scheme;
    @Value("${zookeeper.node_path}")
    private String path;
    @Value("${zookeeper.enable}")
    private boolean zookeeperEnable;

    private Charset CHARSET = Charset.forName("UTF-8");
    private CuratorFramework client;
    private List<ACL> acls = new ArrayList<>();

    @Resource
    private Cache cache;

    @PostConstruct
    public void initServerConnect() {
        if (!zookeeperEnable) {
            return;
        }
        try {
            CuratorFrameworkFactory.Builder builder = CuratorFrameworkFactory.builder()
                    .connectString(urls)
                    .retryPolicy(new RetryNTimes(1, 1000))
                    .connectionTimeoutMs(timeout);

            if (aclEnable) {
                if (!StringUtils.hasText(aclUsername) || !StringUtils.hasText(aclPassword)) {
                    aclEnable = false;
                } else {
                    builder.authorization(scheme, (aclUsername + ":" + aclPassword).getBytes());
                    Id allow = new Id(scheme, DigestAuthenticationProvider.generateDigest(aclUsername + ":" + aclPassword));
                    acls.add(new ACL(ZooDefs.Perms.ALL, allow));
                }
            }
            client = builder.build();
            client.getConnectionStateListenable().addListener(new ConnectionStateListener() {
                @Override
                public void stateChanged(CuratorFramework client, ConnectionState state) {
                    if (state == ConnectionState.SUSPENDED) {
                        logger.warn("connection state has changed: state is {}", state);
                    }
                }
            });
            client.start();
            if (aclEnable) {
                client.setACL().withACL(acls).forPath("/");
            }
            PathChildrenCache childrenCache = new PathChildrenCache(client, path, true);
            addPathChildrenCacheListener(childrenCache);
            childrenCache.start();
        } catch (Exception e) {
            logger.error("connect to zookeeper failed: {}", e.getMessage());
        }
    }


    private void addPathChildrenCacheListener(PathChildrenCache childrenCache) {
        childrenCache.getListenable().addListener(new PathChildrenCacheListener() {
            @Override
            public void childEvent(CuratorFramework curatorFramework, PathChildrenCacheEvent event) throws Exception {
                logger.info("event type: {}", event.getType());
                Map<String, String> address = null;
                Object ifPresent = cache.getIfPresent(path);
                if (null != ifPresent) {
                    address = (Map) ifPresent;
                } else {
                    address = new HashMap<>();
                    cache.put(path, address);
                }
                if (event.getType() == PathChildrenCacheEvent.Type.CHILD_UPDATED || event.getType() == PathChildrenCacheEvent.Type.CHILD_ADDED) {
                    String result = new String(event.getData().getData());
                    logger.info("=================addPathChildrenCacheListener============path: {}, data： {}", event.getData().getPath(), result);
                    address.put(event.getData().getPath(), result);
                } else if (event.getType() == PathChildrenCacheEvent.Type.CHILD_REMOVED) {
                    address.remove(event.getData().getPath());
                } else {
                    return;
                }
            }
        });
    }


    public String getFlowUrlsFromCache() {
        Object urlObj = cache.getIfPresent(path);
        Map<String, String> urlMap = null;
        if (null != urlObj) {
            urlMap = (Map) urlObj;
        }
        if (urlMap == null || urlMap.size() == 0) {
            return null;
        }
        StringJoiner sj = new StringJoiner(";");
        for (String nodeName : urlMap.keySet()) {
            String data = urlMap.get(nodeName);
            JSONObject dataJson = JSON.parseObject(data);
            String host = dataJson.getString(Dict.ZK_DATA_HOST);
            Integer port = dataJson.getInteger(Dict.ZK_DATA_PORT);
            sj.add(host + ":" + port);
        }
        return sj.toString();
    }
}
