package webUploaderDemo.webUploaderDemo.action.contents;

import java.io.File;
import org.apache.commons.lang.StringUtils;
import org.springframework.context.annotation.Scope;

import demo.web.common.BaseAction;
import demo.web.util.FileUtil;
@Scope("prototype") 
public class WebuploaderAction extends BaseAction {
    
    private static final long serialVersionUID = 593845620458229765L;
    
    //属性值，单文件的情况，对应的是upload3.js中的name属性，name属性值为file，此时struts就可以获取到file的文件对象，不需要实例化，struts框架会自动注入对象值，打开调试窗口，看一下就明白了
    private File file;
    //单文件上传的文件名，struts2上传特性，文件名格式为name属性+FileName
    private String fileFileName;
    //多文件上传的文件对象，多文件是一个一个文件上传，所以multiFile是当前正在上传的文件对象
    private File multiFile;
    //多文件上传文件对象的文名，当前正在上传的文件名
    private String multiFileFileName;

    //属性值，接收webupload自带的参数
    private String chunk; // 当前第几个分片
    private String chunks;// 总分片个数
    private String size;// 单个文件的总大小
    
    //自定义属性值
    private String fileSize;//所有文件的总大小
    private String[] multiFileName  ;// 文件名列表
    private String[] fileSizeOneByOne;//每个文件大小
    private String status;
    
  //单文件上传后台代码
    public void ajaxAttachUpload() {
            String path =  "e:\\test\\"+fileFileName;
            try {
                //拿到文件对象
                File file = this.getFile();
                //第一个参数是目标文件的完整路径
                //第二参数是webupload分片传过来的文件
                //FileUtil的这个方法是把目标文件的指针，移到文件末尾，然后把分片文件追加进去，实现文件合并。简单说。就是每次最新的分片合到一个文件里面去。
                FileUtil.randomAccessFile(path, file);
                //如果文件小与5M的话，分片参数chunk的值是null
                //5M的这个阈值是在upload3.js中的chunkSize属性决定的，超过chunkSize设置的大小才会进行分片，否则就不分片，不分片的话，webupload传到后台的chunk参数值就是null
                if(StringUtils.isEmpty(chunk)){
                    //不分片的情况
                    outJson("0", "success", "");
                }else{
                //分片的情况
                //chunk 分片索引，下标从0开始
                //chunks 总分片数
                    if (Integer.valueOf(chunk) == (Integer.valueOf(chunks) - 1)) {
                        outJson("0", "上传成功", "");
                    } else {
                        outJson("2", "上传中" + fileFileName + " chunk:" + chunk, "");
                    }
                }
            } catch (Exception e) {
                outJson("3", "上传失败", "");
            }
        }
    
    
   //多文件上传后台代码
    /***
     * 多文件上传的核心是，前端的文件队列里面，文件一个一个排着队，等第一个文件上传完了，在上传第二个文件，
     * 前端反复多次调用这个方法，mulitiFIleFileName为当前正在上传的文件名
     */
    public void ajaxAttachUpload2() {
    	System.out.println("111");
            String path =  "e:\\test\\"+multiFileFileName;
            /**
             * TODO:可添加自己的业务逻辑实现
             * fileSize;//所有文件的总大小
             * multiFileName  ;// 文件名列表
             * fileSizeOneByOne;//每个文件大小
             * 
             * 后台已经可以拿到这些属性，可以根据每个文件的大小，和总大小计算出  上传的进度百分比等。
             * 或者可以 判断文件上传的大小是否正确。是否丢字节。
             */
             try {
                //拿到当前正在上传的文件对象
                File file = this.getMultiFile();
                FileUtil.randomAccessFile(path, file);
                if(StringUtils.isEmpty(chunk)){
                    //不分片的情况
                    outJson("0", "success", "");
                }else{
                //分片的情况
                //chunk 分片索引，下标从0开始
                //chunks 总分片数
                    if (Integer.valueOf(chunk) == (Integer.valueOf(chunks) - 1)) {
                        outJson("0", "上传成功", "");
                    } else {
                        outJson("2", "上传中" + fileFileName + " chunk:" + chunk, "");
                    }
                }
            } catch (Exception e) {
                outJson("3", "上传失败", "");
            }
        }
    
    
    

    public File getFile() {
        return file;
    }

    public void setFile(File file) {
        this.file = file;
    }

    public String getFileFileName() {
        return fileFileName;
    }

    public void setFileFileName(String fileFileName) {
        this.fileFileName = fileFileName;
    }

    public String getChunk() {
        return chunk;
    }

    public void setChunk(String chunk) {
        this.chunk = chunk;
    }

    public String getChunks() {
        return chunks;
    }

    public void setChunks(String chunks) {
        this.chunks = chunks;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public String getFileSize() {
        return fileSize;
    }

    public void setFileSize(String fileSize) {
        this.fileSize = fileSize;
    }

    public String[] getMultiFileName() {
        return multiFileName;
    }

    public void setMultiFileName(String[] multiFileName) {
        this.multiFileName = multiFileName;
    }

    public String[] getFileSizeOneByOne() {
        return fileSizeOneByOne;
    }

    public void setFileSizeOneByOne(String[] fileSizeOneByOne) {
        this.fileSizeOneByOne = fileSizeOneByOne;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }


    public File getMultiFile() {
        return multiFile;
    }


    public void setMultiFile(File multiFile) {
        this.multiFile = multiFile;
    }


    public String getMultiFileFileName() {
        return multiFileFileName;
    }


    public void setMultiFileFileName(String multiFileFileName) {
        this.multiFileFileName = multiFileFileName;
    }
    
}