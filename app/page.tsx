"use client";

import { useState } from "react";
import { ArrowRight, BarChart3, Check, Clock3, ExternalLink, Flame, Lightbulb, Search, Smartphone, Sparkles, Target, Users } from "lucide-react";

const referenceVideo = "https://www.douyin.com/video/7624168962306259173";

const oceanSteps = [
  { n:"01", title:"搜索「抖音指数」", action:"在抖音首页点右上角放大镜，输入“抖音指数”，找到官方数据工具后点击“进入”。", note:"按截图认准蓝色“抖音指数”小程序入口。", icon:Search },
  { n:"02", title:"点击「榜单」", action:"进入抖音指数后，在页面底部导航点击中间的“榜单”。", note:"不要停留在指数页，后续筛选都在榜单里完成。", icon:BarChart3 },
  { n:"03", title:"选择行业垂类", action:"点击左上角“垂类”选项，在弹出的垂类标签中选择与你账号最接近的行业。", note:"截图以“情感”为例；实体店应选择自己的行业标签。", icon:Target },
  { n:"04", title:"切换「低粉爆款」", action:"在榜单顶部切换到“低粉爆款”，排除大账号粉丝基础带来的数据优势。", note:"这一步是找到可复用选题的核心。", icon:Flame },
  { n:"05", title:"统计周期选择「周榜」", action:"点击页面中间的时间选项，在统计周期里勾选“周榜”，然后点击确定。", note:"周榜样本更稳定，也不会像总榜一样过度陈旧。", icon:Clock3 },
  { n:"06", title:"选择视频指数高的内容", action:"从榜单顶部依次查看视频，优先记录“视频指数”明显较高的低粉爆款。", note:"至少收集3—5条同类视频，再比较它们的标题、开场和结构。", icon:Sparkles },
];

const hotspotSteps = [
  { n:"01", title:"搜索「热点宝」", action:"打开抖音搜索，输入“热点宝”，进入“生活服务热点中心”。", note:"热点宝已可能显示为“生活服务热点中心”。", icon:Search },
  { n:"02", title:"完成账号绑定", action:"首次进入按页面提示绑定抖音账号，然后点击“去查看”。", note:"这是官方工具的正常流程，需在抖音App内完成。", icon:Smartphone },
  { n:"03", title:"进入「爆款视频」", action:"在榜单页找到“爆款视频”或“爆款视频总榜”。", note:"不要停留在话题趋势榜，我们要查看具体视频。", icon:BarChart3 },
  { n:"04", title:"切换「低粉爆款」", action:"把视频总榜切换为“低粉爆款”，然后点击确定。", note:"如果不切换，看到的往往是大V和热点事件，复制价值较低。", icon:Flame },
  { n:"05", title:"选择你的赛道", action:"在“全部垂类”里选择行业；如果列表没有，使用搜索框输入行业关键词。", note:"例如保洁、装修等细分行业，可以直接搜关键词。", icon:Target },
  { n:"06", title:"优先看最近数据", action:"先看近1天找正在起量的内容，再看近3天或近7天验证稳定性。", note:"同一选题有多个低粉账号跑出数据，优先级最高。", icon:Clock3 },
];

export default function Home(){
  const [method,setMethod]=useState<"ocean"|"hotspot">("ocean");
  const steps=method==="ocean"?oceanSteps:hotspotSteps;
  return <main className="guide-page">
    <header className="topbar"><div className="brand"><span className="brandmark"><Flame size={19}/></span><span>低粉爆款查找指南</span><em>LOWFANS PLAYBOOK</em></div><span className="status"><i/>抖音实操版</span></header>
    <section className="guide-hero"><div className="eyebrow"><Sparkles size={14}/>把参考视频里的操作，变成可照着做的流程</div><h1>怎么找到<br/><span>低粉爆款？</span></h1><p>不凭感觉猜选题。用巨量算数或热点宝，找到粉丝少、数据却明显跑出来的视频。</p></section>
    <section className="method-wrap">
      <div className="method-tabs"><button className={method==="ocean"?"active":""} onClick={()=>setMethod("ocean")}><span>METHOD 01</span><b>巨量算数</b><small>适合精细筛选粉丝量、时长和排序</small></button><button className={method==="hotspot"?"active":""} onClick={()=>setMethod("hotspot")}><span>METHOD 02</span><b>热点宝</b><small>适合快速查看最近1—7天的行业爆款</small></button></div>
      <div className="method-title"><div><span>{method==="ocean"?"OCEAN ENGINE":"HOTSPOT TOOL"}</span><h2>{method==="ocean"?"巨量算数查找流程":"热点宝查找流程"}</h2></div><div className="route">{method==="ocean"?"抖音指数 → 榜单 → 垂类 → 低粉爆款 → 周榜":"搜索 → 去查看 → 爆款视频 → 低粉爆款"}</div></div>
      {method==="hotspot"&&<div className="similar-note"><div><Sparkles size={18}/></div><span>热点宝的查找逻辑与巨量算数雷同</span><p>进入爆款视频后，按照“选择垂类 → 低粉爆款 → 时间周期 → 高数据视频”的顺序筛选即可，因此这里不再重复展示操作图片。</p></div>}
      <div className={`step-list ${method==="hotspot"?"text-only":""}`}>{steps.map((step,i)=>{const Icon=step.icon;return <article className="guide-step" key={step.n}><div className="step-no">{step.n}</div><div className="step-icon"><Icon size={22}/></div><div className="step-copy"><small>STEP {i+1}</small><h3>{step.title}</h3><p>{step.action}</p><div className="tip"><Lightbulb size={14}/><span>{step.note}</span></div></div>{method==="ocean"&&<StepShot method={method} step={i}/>}</article>})}</div>
    </section>
    <section className="parameter-section"><div><span className="kicker">RECOMMENDED FILTERS</span><h2>第一次查，直接用这组参数</h2></div><div className="parameter-grid"><div><Clock3/><small>时间</small><b>近3天</b><p>先找正在起量的内容</p></div><div><Users/><small>粉丝数</small><b>3,000—10,000</b><p>越接近普通账号越值得参考</p></div><div><Smartphone/><small>视频时长</small><b>15—60秒</b><p>适合口播和实体老板IP</p></div><div><BarChart3/><small>排序</small><b>点赞量最高</b><p>再进一步比较赞粉比</p></div></div></section>
    <section className="judge-section"><div className="judge-copy"><span className="kicker">FINAL CHECK</span><h2>找到之后，<br/>先别急着拍。</h2><p>用下面四个问题判断，它到底是“选题爆”，还是“作者本身爆”。</p></div><div className="check-list">{["这条视频的点赞是否明显高于账号粉丝量？","这条是否明显高于该账号的平时数据？","同一选题是否有其他低粉账号也做爆了？","你是否有亲身经历、案例或不同观点可以加进去？"].map((x,i)=><div key={x}><span><Check size={15}/></span><b>0{i+1}</b><p>{x}</p></div>)}</div></section>
    <section className="one-line"><Flame size={25}/><div><small>记住这句话</small><h2>学选题，不搬内容；学结构，不抄原句。</h2></div><ArrowRight size={28}/></section>
    <footer><div className="brand"><span className="brandmark"><Flame size={16}/></span><span>低粉爆款查找指南</span></div><p>页面名称可能随抖音版本更新，以App当前显示为准。</p></footer>
  </main>
}

function StepShot({method,step}:{method:"ocean"|"hotspot";step:number}){
  const hotspotFrames=["055","065","075","085","095","095"];
  const src=method==="ocean"?`/guide-screenshots/juliang-0${step+1}.png`:`/reference-frames/frame-${hotspotFrames[step]}.jpg`;
  return <figure className="real-shot">
    <div className="real-shot-head"><span><i/>{method==="ocean"?"你提供的实操截图":"原视频真实截帧"}</span><a href={referenceVideo} target="_blank" rel="noreferrer">打开原视频 <ExternalLink size={11}/></a></div>
    <div className={`real-shot-image ${method==="ocean"?"provided":"video-frame"}`}><img src={src} alt={`${method==="ocean"?"巨量算数":"热点宝"}操作演示截图，第${step+1}步`}/></div>
    <figcaption>{method==="ocean"?`操作截图 ${step+1}/6 · 已按步骤放入指定位置`:"来源：参考视频《做口播别瞎找爆款！两个实用入口直接用》"}</figcaption>
  </figure>
}
