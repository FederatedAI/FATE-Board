package org.fedai.fate.board.conf;

import org.fedai.fate.board.services.FlowHighAvailableService;
import org.fedai.fate.board.utils.TelnetUtil;
import feign.Feign;
import feign.Request;
import feign.RequestTemplate;
import feign.Target;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.openfeign.FeignClientFactoryBean;
import org.springframework.cloud.openfeign.FeignContext;
import org.springframework.cloud.openfeign.Targeter;
import org.springframework.core.env.Environment;

public class RouteTargeter implements Targeter {

    @Autowired
    private FlowHighAvailableService zk;

    private static Environment environment;

    public RouteTargeter(Environment environment) {
        this.environment = environment;
    }

    public static final String URL_PLACE_HOLDER = "DynamicFlowUrl";

    @Override
    public <T> T target(FeignClientFactoryBean factory, Feign.Builder feign, FeignContext context,
                        Target.HardCodedTarget<T> target) {
        return feign.target(new RouteTarget<>(target));
    }

    public class RouteTarget<T> implements Target<T> {
        Logger log = LoggerFactory.getLogger(getClass());
        private Target<T> realTarget;
        private String availableFlow = null;
        private Long lastUpdateTime = null;
        private FlowHighAvailableService flowHighAvailableService = RouteTargeter.this.zk;
        private static final long UPDATE_INTERVAL = 1000 * 30;

        public RouteTarget(Target<T> realTarget) {
            super();
            this.realTarget = realTarget;
        }

        @Override
        public Class<T> type() {
            return realTarget.type();
        }

        @Override
        public String name() {
            return realTarget.name();
        }

        @Override
        public String url() {
            String url = realTarget.url();
            if (url.contains(URL_PLACE_HOLDER)) {
                long currentTime = System.currentTimeMillis();
                if (lastUpdateTime == null || currentTime - lastUpdateTime > UPDATE_INTERVAL) {
                    updateAvailableFlow();
                    lastUpdateTime = currentTime;
                }
                url = url.replace(URL_PLACE_HOLDER, availableFlow);
                log.debug("url changed from {} to {}", realTarget.url(), url);
            }
            return url;
        }

        /**
         * @return 定位到的实际单元号
         */
        private void updateAvailableFlow() {
            String flowUrl = environment.getProperty("fateflow.url");
            if (flowUrl == null) {
                flowUrl = "localhost:9380";
            } else {
                flowUrl = flowUrl.replaceAll("http[s]?://", "");
            }
//            String flowUrlList = environment.getProperty("fateflow.url-list");
            String flowUrlList = flowHighAvailableService.getFlowUrlsFromCache();
            if (flowUrlList == null || flowUrlList.trim().isEmpty()) {
                availableFlow = flowUrl;
            } else if (flowUrlList.trim().split(";").length < 2) {
                availableFlow = flowUrlList.replace(";", "").replaceAll("http[s]?://", "");
            } else {
                String[] flowUrlArr = flowUrlList.replaceAll("http[s]?://", "").split(";");
                for (String url : flowUrlArr) {
                    String[] urlArr = url.split(":");
                    String ip;
                    int port;
                    if (urlArr.length == 2) {
                        ip = urlArr[0];
                        port = Integer.parseInt(urlArr[1]);
                    } else {
                        ip = urlArr[0];
                        port = 80;
                    }
                    if (TelnetUtil.telnet(ip, port, 1000)) {
                        availableFlow = url;
                        break;
                    }
                }
                if (availableFlow == null) {
                    availableFlow = flowUrlArr[0];
                }
            }
        }

        @Override
        public Request apply(RequestTemplate input) {
            if (input.url().indexOf("http") != 0) {
                input.target(url());
            }
            return input.request();
        }

    }
}