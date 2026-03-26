const $ = (sel) => document.querySelector(sel);

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeXml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function initialsOf(name) {
  const cleaned = String(name).trim().replace(/\s+/g, "");
  if (!cleaned) return "Φ";
  return cleaned.slice(0, 2);
}

function makeAvatarDataUri(initials, c1, c2) {
  const safeInitials = escapeXml(initials);
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/>
      <stop offset="1" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <circle cx="60" cy="60" r="58" fill="url(#g)" stroke="rgba(255,255,255,0.45)" stroke-width="2"/>
  <text x="50%" y="54%" text-anchor="middle" font-family="system-ui, Segoe UI, Arial"
    font-size="44" font-weight="800" fill="rgba(255,255,255,0.95)">${safeInitials}</text>
</svg>`.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const schools = [
  {
    period: "前5-4世纪（古希腊）",
    name: "古希腊哲学",
    summary: "从“什么是德性/正义/知识”开始，逐步把追问变成可讨论的论证方式。",
    accent: ["#ff4fa3", "#ffd1e8"],
    people: [
      {
        name: "苏格拉底",
        intro: "用诘问暴露概念的含糊处：真正的智慧来自于承认自己的无知与不断澄清。",
        keywords: ["诘问法", "德性知识", "无知之知"]
      },
      {
        name: "柏拉图",
        intro: "强调理念世界与灵魂结构：通过对话形式把概念放到更稳定的定义框架里。",
        keywords: ["理念论", "灵魂三分", "洞穴比喻"]
      },
      {
        name: "亚里士多德",
        intro: "把解释与分类做成工具：关注因果、目的与在经验中组织概念的方法。",
        keywords: ["实体与因因", "德性伦理", "形式逻辑"]
      }
    ]
  },
  {
    period: "前3-前2世纪（希腊化时期）",
    name: "斯多葛主义",
    summary: "把哲学当作“生活的训练”：强调宇宙秩序、德性优先，以及对不可控之事的态度。",
    accent: ["#ff5fae", "#ffc2e6"],
    people: [
      {
        name: "塞涅卡",
        intro: "从道德教养入手：把理性、情感调节与自律结合到日常实践。",
        keywords: ["情感训练", "自律", "德性优先"]
      },
      {
        name: "爱比克泰德",
        intro: "区分可控/不可控：把选择建立在判断能力而非外在结果之上。",
        keywords: ["可控性", "判断训练", "内在自由"]
      },
      {
        name: "马可·奥勒留",
        intro: "把反思写成“日常冥想”：在压力中保持对德性的忠诚。",
        keywords: ["反思写作", "宇宙秩序", "责任"]
      }
    ]
  },
  {
    period: "11-13世纪（经院哲学）",
    name: "经院哲学",
    summary: "在信仰与理性之间搭桥：用逻辑与论证来组织对上帝、存在与知识的理解。",
    accent: ["#ff4fa3", "#fff1f8"],
    people: [
      {
        name: "安瑟伦",
        intro: "提出上帝存在的理性论证，推动“信仰也要能被理解”的路线。",
        keywords: ["本体论证", "理性理解", "信仰与论证"]
      },
      {
        name: "托马斯·阿奎那",
        intro: "综合亚里士多德传统与基督教教义：以“因果与目的”组织世界观。",
        keywords: ["五路论证", "因果性", "自然律"]
      },
      {
        name: "约翰·邓斯·司各脱",
        intro: "细化概念与形而上结构：强调形式差异与更严格的区分。",
        keywords: ["概念精细化", "存在方式", "区分与推理"]
      }
    ]
  },
  {
    period: "17-18世纪（近代：经验论）",
    name: "近代经验论",
    summary: "从经验与证据出发：质疑哪些观念来自感觉，哪些来自心灵的结构。",
    accent: ["#ff6bbd", "#ffd7ea"],
    people: [
      {
        name: "约翰·洛克",
        intro: "把心灵解释为“白板”：知识从经验而来，但需要讨论观念的来源与边界。",
        keywords: ["白板说", "经验来源", "观念分析"]
      },
      {
        name: "乔治·贝克莱",
        intro: "强调“存在即被感知”：把物的稳定性重新解释为感知结构与观念关联。",
        keywords: ["物存在即被感知", "观念依赖", "理性与经验"]
      },
      {
        name: "大卫·休谟",
        intro: "追问因果、归纳与必然性：把怀疑带到论证最敏感的环节。",
        keywords: ["因果怀疑", "归纳问题", "观念关联"]
      }
    ]
  },
  {
    period: "17世纪（近代理性主义）",
    name: "近代理性主义",
    summary: "强调理性的结构力量：在数学般的确定性理想下重新安排知识的基础。",
    accent: ["#ff4fa3", "#ffe0f3"],
    people: [
      {
        name: "笛卡尔",
        intro: "用方法性怀疑寻找不可动摇的基础：把“我在思考”作为起点。",
        keywords: ["方法怀疑", "我思故我在", "理性基础"]
      },
      {
        name: "斯宾诺莎",
        intro: "追求单一实体的统一解释：世界在必然性下呈现为一个整体。",
        keywords: ["实体一元论", "必然性", "理性几何化"]
      },
      {
        name: "莱布尼茨",
        intro: "主张充分理由与可理解的秩序：把单子作为解释世界的基本单位。",
        keywords: ["充分理由", "单子论", "最优可能世界"]
      }
    ]
  },
  {
    period: "18世纪末-19世纪初（德国古典）",
    name: "德国古典哲学",
    summary: "把“主体如何可能认识世界”推到前台：并把历史与理性理解成动态过程。",
    accent: ["#ff52a6", "#ffe8f3"],
    people: [
      {
        name: "伊曼努尔·康德",
        intro: "在现象与自在之物之间划出界线：知识的必然结构来自经验与范畴的结合。",
        keywords: ["哥白尼式转向", "范畴框架", "先验条件"]
      },
      {
        name: "格奥尔格·威廉·弗里德里希·黑格尔",
        intro: "把概念当作历史的推进器：通过辩证展开让矛盾转化为更高层次的理解。",
        keywords: ["辩证法", "绝对精神", "历史展开"]
      },
      {
        name: "约翰·戈特利布·费希特",
        intro: "强调主体活动：自我意识的行动构成知识与世界显现的条件。",
        keywords: ["主体活动", "自我设定", "行动基础"]
      }
    ]
  },
  {
    period: "19-20世纪（存在主义）",
    name: "存在主义",
    summary: "关注人的处境：自由如何可能、焦虑如何出现、选择如何塑造“你是谁”。",
    accent: ["#ff4fa3", "#ffd1e8"],
    people: [
      {
        name: "索伦·克尔凯郭尔",
        intro: "把信仰与选择写成“生存的决断”：强调个体面临的内在风险。",
        keywords: ["主观真理", "跃迁", "焦虑与选择"]
      },
      {
        name: "马丁·海德格尔",
        intro: "从“在世存在”理解人：把理解、时间与关怀视为基础结构。",
        keywords: ["在世存在", "此在", "时间性"]
      },
      {
        name: "让-保罗·萨特",
        intro: "强调存在先于本质：人通过选择不断书写自己。",
        keywords: ["存在先于本质", "自由与责任", "坏信念"]
      }
    ]
  },
  {
    period: "20世纪（分析哲学）",
    name: "分析哲学",
    summary: "把哲学变成“概念的工程”：通过语言与逻辑澄清问题，而非靠修辞取胜。",
    accent: ["#ff6bbd", "#ffe0f3"],
    people: [
      {
        name: "戈特洛布·弗雷格",
        intro: "把意义与指称区分清楚：推动现代逻辑与语义分析的基础框架。",
        keywords: ["意义/指称", "逻辑基础", "可计算性理想"]
      },
      {
        name: "伯特兰·罗素",
        intro: "用逻辑重建数学与知识结构：并推动对“描述”的精确处理。",
        keywords: ["逻辑原子主义", "描述理论", "知识的形式化"]
      },
      {
        name: "路德维希·维特根斯坦",
        intro: "关注语言如何“使用”：问题往往来自概念在语言中的误用。",
        keywords: ["语言游戏", "意义即用法", "图像理论/转向"]
      }
    ]
  },
  {
    period: "20世纪后半（后现代/后结构主义）",
    name: "后现代/后结构主义",
    summary: "质疑宏大叙事：强调知识与权力的交织，并揭示概念内部的差异机制。",
    accent: ["#ff4fa3", "#fff1f8"],
    people: [
      {
        name: "米歇尔·福柯",
        intro: "把知识看作制度化的产物：权力在话语中运作，塑造可说与不可说。",
        keywords: ["话语与权力", "知识考古", "谱系学"]
      },
      {
        name: "雅克·德里达",
        intro: "用“差异/延异”拆解固定意义：文本的结构永远在生成而非封闭。",
        keywords: ["延异", "解构", "差异机制"]
      },
      {
        name: "让-弗朗索瓦·利奥塔",
        intro: "对“宏大叙事”的怀疑：强调多元话语与合法性标准的变化。",
        keywords: ["反宏大叙事", "合法性问题", "多元叙事"]
      }
    ]
  }
];

function renderTimeline() {
  const root = $("#timelineRoot");
  if (!root) return;

  root.innerHTML = schools
    .map((school) => {
      const c1 = school.accent?.[0] || "#ff4fa3";
      const c2 = school.accent?.[1] || "#ffd1e8";

      const peopleHtml = (school.people || [])
        .slice(0, 3)
        .map((p) => {
          const initials = initialsOf(p.name);
          const avatar = makeAvatarDataUri(initials, c1, c2);

          return `
            <div class="person-card">
              <div class="avatar-wrap">
                <img class="avatar" src="${avatar}" alt="${escapeHtml(p.name)} 头像" />
              </div>
              <div>
                <div class="person-name">${escapeHtml(p.name)}</div>
                <div class="person-intro">${escapeHtml(p.intro)}</div>
                <div class="keywords">
                  ${(p.keywords || []).slice(0, 3).map((k) => `<span class="keyword">${escapeHtml(k)}</span>`).join("")}
                </div>
              </div>
            </div>
          `;
        })
        .join("");

      return `
        <div class="timeline-item">
          <p class="timeline-period">${escapeHtml(school.period)}</p>
          <h3 class="timeline-title">${escapeHtml(school.name)}</h3>
          <p class="timeline-summary">${escapeHtml(school.summary)}</p>
          <div class="people-grid">${peopleHtml}</div>
        </div>
      `;
    })
    .join("");
}

document.addEventListener("DOMContentLoaded", () => {
  renderTimeline();
});

