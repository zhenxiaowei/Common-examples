//iview 简单布局    基本结构
<template>
    <div>
        <Layout>
            <Header class="header">header</Header>
            <Content class="content">content</Content>
            <Footer class="footer">footer</Footer>
        </Layout>
</br>
        <Layout>
            <Header class="header">header</Header>
            <Layout>
                <Sider hide-trigger class="sider">sider</Sider>
                <Content class="content">content</Content>
            </Layout>

            <Footer class="footer">footer</Footer>
        </Layout>
</br>
        <Layout>
            <Header class="header">header</Header>
            <Layout>
                <Content class="content">content</Content>
                <Sider hide-trigger class="sider">sider</Sider>
            </Layout>

            <Footer class="footer">footer</Footer>
        </Layout>
</br>
        <Layout>
            <Sider hide-trigger class="sider">sider</Sider>
            <Layout>
                <Header class="header">header</Header>
                <Content class="content">content</Content>
                <Footer class="footer">footer</Footer>
            </Layout>
        </Layout>
        </br>
    </div>
</template>

<script>
  export default {

  }

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.header{
  background:red;
}
.sider{
background:yellow
}
.content{
  background:blue;
}
.footer{
   background:green;
}
</style>
