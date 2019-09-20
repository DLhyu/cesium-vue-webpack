<template>
    <div style="width: 100%; height: 100%">
        <div style="position: relative; width: 100%; height: 100%" ref="coreViewer">
            <div ref="viewer" style="width: 100%; height: 100%"></div>
            <div ref="eyeViewer" class="hawkEye" v-show="eyeViewer"></div>
            <div id="ToolTip" style="font-size: 10px;z-index: 999; position: absolute; color: #ffffff; display: none"></div>
            <div style="position: absolute; top: 10px; left: 10px; padding: 0px; background-color: rgba(0, 0, 0, 0.2); border-radius: 10px;">
                <Button type="primary" style="margin: 5px;" shape="circle" icon="ios-home" @click="goHome" title="复位"></Button>
                <Button type="primary" style="margin-right: 5px;" shape="circle" :icon="isFullscreen ? 'ios-contract' : 'ios-expand'" @click="enableFullscreen(!isFullscreen)" title="全屏" ></Button>

                <Dropdown trigger="click" placement="bottom-start">
                    <Button type="primary" style="margin: 5px;" shape="circle" icon="ios-hammer" title="量测"></Button>
                    <!--<Icon type="ios-arrow-down"></Icon>-->
                    <DropdownMenu slot="list">
                        <DropdownItem><Button type="primary" icon="ios-american-football-outline" @click="makeDistance">测距</Button></DropdownItem>
                        <DropdownItem><Button type="primary" icon="ios-appstore-outline" @click="makeArea">量面</Button></DropdownItem>
                        <!--<DropdownItem><Button type="primary" icon="ios-trash-outline" @click="clearMea">清除</Button></DropdownItem>-->
                    </DropdownMenu>
                </Dropdown>
                <Dropdown trigger="click" placement="bottom-start">
                    <Button type="primary" style="margin: 5px;" shape="circle" icon="ios-create-outline" title="数据编辑"></Button>
                    <DropdownMenu slot="list">
                        <DropdownItem>
                            <Row>
                                <Col>
                                    <Card>
                                        <p slot="title">二维类</p>
                                        <!--<Button type="primary" icon="ios-pin" title="标记" @click="draw2icon"></Button>-->
                                        <Button type="primary" icon="ios-ionic-outline" title="点" @click="draw2point"></Button>
                                        <Button type="primary" icon="ios-pulse-outline" title="线" @click="draw2polyline"></Button>
                                        <Button type="primary" icon="ios-create" title="面" @click="draw2polygon"></Button>
                                        <Button type="primary" icon="ios-create-outline" title="矩形" @click="draw2rectangle"></Button>
                                        <Button type="primary" icon="ios-add-circle-outline" title="圆" @click="draw2circle"></Button>
                                        <Button type="primary" icon="ios-add-circle-outline" title="扇形" @click="draw2sector"></Button>
                                    </Card>
                                </Col>
                            </Row>
                        </DropdownItem>
                        <DropdownItem divided>
                            <Row>
                                <Col>
                                    <Card>
                                        <p slot="title">三维类</p>
                                        <Button type="primary" icon="md-disc" title="球体 " @click="draw3sphere"></Button>
                                        <Button type="primary" icon="ios-pulse-outline" title="管道线" @click="draw3polylineVolume"></Button>
                                        <Button type="primary" icon="md-book" title="墙体" @click="draw3wall"></Button>
                                        <Button type="primary" icon="ios-cube-outline" title="多面体" @click="draw3polygon"></Button>
                                        <Button type="primary" icon="ios-cube-outline" title="长方体" @click="draw3rectangle"></Button>
                                        <Button type="primary" icon="ios-cube-outline" title="圆柱体" @click="draw3cylinder"></Button>
                                    </Card>
                                </Col>
                            </Row>
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
                <Dropdown trigger="click" placement="bottom-start" @on-click="spatialAnalysis">
                    <Button type="primary" style="margin: 5px;" shape="circle" icon="ios-color-palette-outline" title="空间分析"></Button>
                    <DropdownMenu slot="list">
                        <DropdownItem name="bufferAnalysis">缓冲区分析</DropdownItem>
                        <DropdownItem name="dataBoxSelection">数据框选</DropdownItem>
                        <DropdownItem name="sunshineAnalysis">日照分析</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
                <Dropdown trigger="click" placement="bottom-start" @on-click="topicsAnalysis">
                    <Button type="primary" style="margin: 5px;" shape="circle" icon="logo-buffer" title="专题分析"></Button>
                    <DropdownMenu slot="list">
                        <DropdownItem name="meteorological">气象专题</DropdownItem>
                        <DropdownItem name="ocean">海洋专题</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
                <Button type="primary" style="margin: 5px;" shape="circle" icon="ios-trash-outline" @click="clearMea" title="清除"></Button>
            </div>
            <div style="position: absolute; top: 60px; left: 10px;">
                <Dropdown trigger="click" placement="bottom-start">
                    <Button type="primary" icon="ios-settings" title="设置">
                        设置
                        <Icon type="ios-arrow-down"></Icon>
                    </Button>
                    <DropdownMenu slot="list">
                        <Tabs style="padding-left: 5px;">
                            <TabPane label="底图" name="baseMap">
                                <RadioGroup v-model="basemap" @on-change="changeLayer">
                                    <Radio label="google">
                                        <span>谷歌地图</span>
                                    </Radio>
                                    <Radio label="tianditu">
                                        <span>天地图影像</span>
                                    </Radio>
                                    <Radio label="single">
                                        <span>单张图片</span>
                                    </Radio>
                                    <Radio label="bing">
                                        <span>Bing地图</span>
                                    </Radio>
                                </RadioGroup>
                                <Divider style="margin: 5px 0"/>
                                <CheckboxGroup v-model="labelImagery" @on-change="enableLabelImagery(labelImagery)">
                                    <Checkbox label="labelTianditu">
                                        <span>天地图注记</span>
                                    </Checkbox>
                                </CheckboxGroup>
                            </TabPane>
                            <TabPane label="基础设置" name="foundationSetup">
                                <Checkbox v-model="terrain" @on-change="enableTerrain(terrain)">显示地形</Checkbox>
                                <Checkbox v-model="light" @on-change="enableLight(light)">开启光照</Checkbox>
                                <Checkbox v-model="depthTest" @on-change="enableDepthTest(depthTest)">深度检测</Checkbox>
                                <Checkbox v-model="atmosphere" @on-change="enableAtmosphere(atmosphere)">大气层</Checkbox>
                                <Divider style="margin: 5px 0"/>
                                <!--<i-switch size="large" @on-change="changeEarthRotation">-->
                                    <!--<span slot="open">开启</span>-->
                                    <!--<span slot="close">关闭</span>-->
                                <!--</i-switch>-->
                                <i-switch size="small" @on-change="changeEarthRotation"></i-switch>
                                <span>地球自转</span>
                                <i-switch v-model="eyeViewer" size="small"></i-switch>
                                <span>鹰眼</span>
                            </TabPane>
                        </Tabs>
                    </DropdownMenu>
                </Dropdown>
            </div>
            <div id="location_bar" class="location-bar animation-slide-bottom no-print"
                 style="position: absolute; left: 42%; bottom: 0px; z-index: 991; padding: 3px 10px; font-size: 14px; color: #d5d500; text-align: right; text-shadow: 2px 2px 2px #000; background-color: rgba(0,0,0,.0);">
                <div ref="location_height" style="float: right; min-width: 80px; margin-right: 10px;"></div>
                <div ref="location_lat" style="float: right; min-width: 80px; margin-right: 10px;"></div>
                <div ref="location_lon" style="float: right; min-width: 80px; margin-right: 10px;"></div>
            </div>
            <!--<video id="trailer" muted="" autoplay="" loop="" crossorigin="" controls="">-->
                <!--<source src="https://cesiumjs.org/videos/Sandcastle/big-buck-bunny_trailer.webm" type="video/webm">-->
                <!--<source src="https://cesiumjs.org/videos/Sandcastle/big-buck-bunny_trailer.mp4" type="video/mp4">-->
                <!--<source src="https://cesiumjs.org/videos/Sandcastle/big-buck-bunny_trailer.mov" type="video/quicktime">-->
                <!--Your browser does not support the <code>video</code> element.-->
            <!--</video>-->
            <div class="buffer-analysis" ref="bufferAnalysis" v-show="bufferAnalysis">
                <div slot="top" class="buffer-analysis-pane">
                    <span>缓冲半径：</span>
                    <InputNumber :max="999" :min="1" v-model="bufferRadius"></InputNumber>
                    <span>（公里）</span>
                    <Button v-model="polygon" @click="bufferAnalysisFc(polygon, bufferRadius)">面</Button>
                    <Button v-model="polyline" @click="bufferAnalysisFc(polyline, bufferRadius)">线</Button>
                    <Button v-model="point" @click="bufferAnalysisFc(point, bufferRadius)">点</Button>
                </div>
            </div>
            <div class="data-box-selection" v-show="dataBoxSelection">
                <div slot="top" class="data-box-selection-pane">
                    <span>数据框选：</span>
                    <Button v-model="rectangle" @click="dataBoxSelectionFc(rectangle)">矩形</Button>
                    <Button v-model="circle" @click="dataBoxSelectionFc(circle)">圆</Button>
                    <Button v-model="polygon" @click="dataBoxSelectionFc(polygon)">面</Button>
                    <Button @click="clearDataBoxSelection">清除</Button>
                </div>
            </div>
            <div class="m-topics" v-show="meteorologicalTopics">
                <Card :bordered="false" dis-hover>
                    <p slot="title">{{m_title}}</p>
                    <p>气象要素：
                        <Select v-model="ele" style="width:70px">
                            <Option v-for="item in meList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                        </Select>
                        区域：
                        <Select v-model="region" style="width:70px">
                            <Option v-for="item in regionList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                        </Select>
                        <Button type="primary" title="开始" @click="meteorologicalTopicsStart(ele, region)">开始</Button>
                        <Button type="primary" title="暂停" @click="meteorologicalTopicsEnd()">暂停</Button>
                    </p>
                </Card>
            </div>
        </div>
    </div>
</template>

<script src="../scripts/init.js"></script>
