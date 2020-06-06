import Taro from "@tarojs/taro";
import qs from "qs";
import pages, { pageMap } from "@/common/route/pages";
import Page from "@/common/route/page";
import { check } from "@/common/auth";

function onPageRouteError(e?: any) {
  console.error("路由", e);
  Taro.reLaunch({ url: pages.home.name });
}

const parse = (u: string, params?: any): { u: string; page?: Page } => {
  if (!u) {
    console.error("页面路径错误");
    return {
      u: pages.home.name,
      page: pages.home
    };
  }
  const [path, search] = u.split("?");
  const s = qs.stringify({
    ...qs.parse(search),
    ...params
  });
  const page = pageMap[path];
  return {
    page,
    u: `${(page && page.path) || path}?${s}`
  };
};

const route = (u: string, params?: any, func?: Function) => {
  const { u: url, page } = parse(u, params);
  const fun = func || Taro.navigateTo;
  if (page) {
    check({
      type: page.auth
    }).then(ok => {
      if (ok) {
        fun({ url }).catch(onPageRouteError);
      }
    });
  } else {
    // TODO
    fun({ url }).catch(onPageRouteError);
  }
};

function navigate(url: string, params?: any) {
  route(url, params, Taro.navigateTo);
}

function web(url: string, params?: any) {}

function redirect(url: string, params?: any) {
  route(url, params, Taro.redirectTo);
}

function tab(url: string, params?: any) {
  route(url, params, Taro.switchTab);
}

function launch(url: string, params?: any) {
  route(url, params, Taro.reLaunch);
}

function go(uri: Uri, params?: any) {
  if (uri.url) {
    switch (uri.urlType) {
      case "self":
        return navigate(uri.url, params);
      case "web":
        return web(uri.url, params);
      case "mini":
        if (uri.appId) {
          return Taro.navigateToMiniProgram({
            path: uri.url,
            appId: uri.appId
          });
        }
    }
  }
}

function back(delta: number = 1, delay: number = 0) {
  if (delay <= 0) {
    Taro.navigateBack({ delta });
  } else {
    const task = setTimeout(() => {
      Taro.navigateBack({ delta });
      clearTimeout(task);
    }, delay);
  }
}

Taro.$web = web;
Taro.$navigate = navigate;
Taro.$redirect = redirect;
Taro.$tab = tab;
Taro.$go = go;
Taro.$launch = launch;
Taro.$back = back;