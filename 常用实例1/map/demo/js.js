window.HTMap = window.HTMap || {
        versions: "1.0.6.3",
        CoordSys: {
            GOOGLE: 1,
            RECTANGULAR: 2
        },
        mapConfig: {
            FirstZoomTileRows: 1,
            FirstZoomTileCols: 1,

            CoordSys: 2,
            TileSize: 256,
            MaxZoomLevel: null,
            MinZoomLevel: null,
            FullExtent: null,
            AreaRestriction:null,

            CoordFixed:6,

            RotateConfig:{
                /*地图旋转配置 opts.RotateConfig */
                Angle:0,//旋转角度（逆时针、角度值）
                MinX:0,//地图左上角的真实经度(地图以此点为旋转中心)
                MaxY:0,//地图左上角的真实纬度
                FirstZoomPixelRatioX:0,//第一个级别下的经度与像素的比值
                FirstZoomPixelRatioY:0//第一个级别下的纬度与像素的比值
            },

            TransformConfig:{
                //三个映射点[{cx,cy,dx,dy}]数值坐标 实际坐标
                PointMap1:null,PointMap2:null,PointMap3:null,
                PointMaps:[]
            }
        },
        Transform:{
            /*矩阵运算包,来自dojox/math*/
            matrix:{
                iDF:0,
                ALMOST_ZERO: 1e-10,
                multiply: function(/* Array */a, /* Array */b){
                    // summary:
                    //		Multiply matrix a by matrix b.
                    var ay=a.length, ax=a[0].length, by=b.length, bx=b[0].length;
                    if(ax!=by){
                        console.warn("Can't multiply matricies of sizes " + ax + "," + ay + " and " + bx + "," + by);
                        return [[0]];
                    }
                    var c=[];
                    for (var k=0; k<ay; k++) {
                        c[k]=[];
                        for(var i=0; i<bx; i++){
                            c[k][i]=0;
                            for(var m=0; m<ax; m++){
                                c[k][i]+=a[k][m]*b[m][i];
                            }
                        }
                    }
                    return c;	// Array
                },
                product: function(/* Array... */){
                    // summary:
                    //		Return the product of N matrices
                    if (arguments.length==0){
                        console.warn("can't multiply 0 matrices!");
                        return 1;
                    }
                    var m=arguments[0];
                    for(var i=1; i<arguments.length; i++){
                        m=this.multiply(m, arguments[i]);
                    }
                    return m;	// Array
                },
                sum: function(/* Array... */){
                    // summary:
                    //		Return the sum of N matrices
                    if(arguments.length==0){
                        console.warn("can't sum 0 matrices!");
                        return 0;	// Number
                    }
                    var m=this.copy(arguments[0]);
                    var rows=m.length;
                    if(rows==0){
                        console.warn("can't deal with matrices of 0 rows!");
                        return 0;
                    }
                    var cols=m[0].length;
                    if(cols==0){
                        console.warn("can't deal with matrices of 0 cols!");
                        return 0;
                    }
                    for(var i=1; i<arguments.length; ++i){
                        var arg=arguments[i];
                        if(arg.length!=rows || arg[0].length!=cols){
                            console.warn("can't add matrices of different dimensions: first dimensions were " + rows + "x" + cols + ", current dimensions are " + arg.length + "x" + arg[0].length);
                            return 0;
                        }
                        for(var r=0; r<rows; r++) {
                            for(var c=0; c<cols; c++) {
                                m[r][c]+=arg[r][c];
                            }
                        }
                    }
                    return m;	// Array
                },
                inverse: function(/* Array */a){
                    // summary:
                    //		Return the inversion of the passed matrix
                    if(a.length==1 && a[0].length==1){
                        return [[1/a[0][0]]];	// Array
                    }
                    var tms=a.length, m=this.create(tms, tms), mm=this.adjoint(a), det=this.determinant(a), dd=0;
                    if(det==0){
                        console.warn("Determinant Equals 0, Not Invertible.");
                        return [[0]];
                    }else{
                        dd=1/det;
                    }
                    for(var i=0; i<tms; i++) {
                        for (var j=0; j<tms; j++) {
                            m[i][j]=dd*mm[i][j];
                        }
                    }
                    return m;	// Array
                },
                determinant: function(/* Array */a){
                    // summary:
                    //		Calculate the determinant of the passed square matrix.
                    if(a.length!=a[0].length){
                        console.warn("Can't calculate the determinant of a non-squre matrix!");
                        return 0;
                    }
                    var tms=a.length, det=1, b=this.upperTriangle(a);
                    for (var i=0; i<tms; i++){
                        var bii=b[i][i];
                        if (Math.abs(bii)<this.ALMOST_ZERO) {
                            return 0;	// Number
                        }
                        det*=bii;
                    }
                    det*=this.iDF;
                    return det;	// Number
                },
                upperTriangle: function(/* Array */m){
                    // summary:
                    //		Find the upper triangle of the passed matrix and return it.
                    m=this.copy(m);
                    var f1=0, temp=0, tms=m.length, v=1;
                    this.iDF=1;
                    for(var col=0; col<tms-1; col++){
                        if(typeof m[col][col]!="number") {
                            console.warn("non-numeric entry found in a numeric matrix: m[" + col + "][" + col + "]=" + m[col][col]);
                        }
                        v=1;
                        var stop_loop=0;
                        while((m[col][col] == 0) && !stop_loop){
                            if (col+v>=tms){
                                this.iDF=0;
                                stop_loop=1;
                            }else{
                                for(var r=0; r<tms; r++){
                                    temp=m[col][r];
                                    m[col][r]=m[col+v][r];
                                    m[col+v][r]=temp;
                                }
                                v++;
                                this.iDF*=-1;
                            }
                        }
                        for(var row=col+1; row<tms; row++){
                            if(typeof m[row][col]!="number"){
                                console.warn("non-numeric entry found in a numeric matrix: m[" + row + "][" + col + "]=" + m[row][col]);
                            }
                            if(typeof m[col][row]!="number"){
                                console.warn("non-numeric entry found in a numeric matrix: m[" + col + "][" + row + "]=" + m[col][row]);
                            }
                            if(m[col][col]!=0){
                                var f1=(-1)* m[row][col]/m[col][col];
                                for (var i=col; i<tms; i++){
                                    m[row][i]=f1*m[col][i]+m[row][i];
                                }
                            }
                        }
                    }
                    return m;	// Array
                },
                create: function(/* Number */a, /* Number */b, /* Number? */value){
                    // summary:
                    //		Create a new matrix with rows a and cols b, and pre-populate with value.
                    value=value||0;
                    var m=[];
                    for (var i=0; i<b; i++){
                        m[i]=[];
                        for(var j=0; j<a; j++) {
                            m[i][j]=value;
                        }
                    }
                    return m;	// Array
                },
                ones: function(/* Number */a, /* Number */b){
                    // summary:
                    //		Create a matrix pre-populated with ones
                    return this.create(a, b, 1);	// Array
                },
                zeros: function(/* Number */a, /* Number */b){
                    // summary:
                    //		Create a matrix pre-populated with zeros
                    return this.create(a, b);	// Array
                },
                identity: function(/* Number */size, /* Number? */scale){
                    // summary:
                    //		Create an identity matrix based on the size and scale.
                    scale=scale||1;
                    var m=[];
                    for(var i=0; i<size; i++){
                        m[i]=[];
                        for(var j=0; j<size; j++){
                            m[i][j]=(i==j?scale:0);
                        }
                    }
                    return m;	// Array
                },
                adjoint: function(/* Array */a){
                    // summary:
                    //		Find the adjoint of the passed matrix
                    var tms=a.length;
                    if(tms<=1){
                        console.warn("Can't find the adjoint of a matrix with a dimension less than 2");
                        return [[0]];
                    }
                    if(a.length!=a[0].length){
                        console.warn("Can't find the adjoint of a non-square matrix");
                        return [[0]];
                    }
                    var m=this.create(tms, tms), ap=this.create(tms-1, tms-1);
                    var ii=0, jj=0, ia=0, ja=0, det=0;
                    for(var i=0; i<tms; i++){
                        for (var j=0; j<tms; j++){
                            ia=0;
                            for(ii=0; ii<tms; ii++){
                                if(ii==i){
                                    continue;
                                }
                                ja = 0;
                                for(jj=0; jj<tms; jj++){
                                    if(jj==j){
                                        continue;
                                    }
                                    ap[ia][ja] = a[ii][jj];
                                    ja++;
                                }
                                ia++;
                            }
                            det=this.determinant(ap);
                            m[i][j]=Math.pow(-1, (i+j))*det;
                        }
                    }
                    return this.transpose(m);	// Array
                },
                transpose: function(/* Array */a){
                    // summary:
                    //		Transpose the passed matrix (i.e. rows to columns)
                    var m=this.create(a.length, a[0].length);
                    for(var i=0; i<a.length; i++){
                        for(var j=0; j<a[i].length; j++){
                            m[j][i]=a[i][j];
                        }
                    }
                    return m;	// Array
                },
                format: function(/* Array */a, /* Number? */points){
                    // summary:
                    //		Return a string representation of the matrix, rounded to points (if needed)
                    points=points||5;
                    function format_int(x, dp){
                        var fac=Math.pow(10, dp);
                        var a=Math.round(x*fac)/fac;
                        var b=a.toString();
                        if(b.charAt(0)!="-"){
                            b=" "+b;
                        }
                        if(b.indexOf(".")>-1){
                            b+=".";
                        }
                        while(b.length<dp+3){
                            b+="0";
                        }
                        return b;
                    }
                    var ya=a.length;
                    var xa=ya>0?a[0].length:0;
                    var buffer="\n";
                    for(var y=0; y<ya; y++){
                        buffer+="| ";
                        for(var x=0; x<xa; x++){
                            buffer+=format_int(a[y][x], points)+" ";
                        }
                        buffer+="|\n";
                    }
                    return buffer;	// string
                },
                copy: function(/* Array */a){
                    // summary:
                    //		Create a copy of the passed matrix
                    var ya=a.length, xa=a[0].length, m=this.create(xa, ya);
                    for(var y=0; y<ya; y++){
                        for(var x=0; x<xa; x++){
                            m[y][x]=a[y][x];
                        }
                    }
                    return m;	// Array
                },
                scale: function(/* Array */a, /* Number */factor){
                    // summary:
                    //		Create a copy of passed matrix and scale each member by factor.
                    a=this.copy(a);
                    var ya=a.length, xa=a[0].length;
                    for(var y=0; y<ya; y++){
                        for(var x=0; x<xa; x++){
                            a[y][x]*=factor;
                        }
                    }
                    return a;
                }
            },
            _affineTransformation:function(/*2*2缩放、旋转矩阵*/sr,/*2*1平移矩阵*/m,/*坐标*/x,y){
                var r = this.matrix.multiply([[x,y]],sr);
                var rc = this.matrix.sum(r,m);
                return {x:rc[0][0],y:rc[0][1]};
            },

            _txC2D:null,_tyC2D:null,_txD2C:null,_tyD2C:null,
            //高斯消元解线性方程 n为元数，m为方程参数(n*n)矩阵,r为方程结果(1*n)矩阵
            _gauss:function(n,m,r){
                var a=[],b=[];
                for(var index=0;index<n;index++){
                    a[index]=[];
                    for(var index2=0;index2<n;index2++)a[index][index2]=m[index][index2];
                }
                for(var index=0;index<n;index++)b[index]=r[index];
                var x=[];
                for(var index=0;index<n;index++)x.push(0);
                var i=0,j=0,k=0,m=0;
                var c=0,d0=0,d1=0;
                for (k=0;k<n-1;k++)//选主元
                {
                    m=k;
                    d0=Math.abs(a[m][k]);
                    for(i=k+1;i<n;i++)
                    {
                        if (Math.abs(a[i][k])>d0)
                        {
                            m=i;
                            d0=Math.abs(a[m][k]);
                        }
                    }
                    //交换行
                    if(m!=k)
                    {
                        for(i=k;i<n;i++)
                        {
                            d1=a[m][i];
                            a[m][i]=a[k][i];
                            a[k][i]=d1;
                        }
                        d1=b[m];
                        b[m]=b[k];
                        b[k]=d1;
                    }
                    for(i=k+1;i<n;i++)
                    {
                        c=a[i][k]/a[k][k];
                        for(j=k;j<n;j++)
                            a[i][j]=a[i][j]-c*a[k][j];
                        b[i]=b[i]-c*b[k];
                    }
                }
                //回代
                x[n-1]=b[n-1]/a[n-1][n-1];
                for(k=n-2;k>=0;k--)
                {
                    d0=b[k];
                    for(i=n-1;i>k-1;i--)
                    {
                        d0=d0-a[k][i]*x[i];
                    }
                    x[k]=d0/a[k][k];
                }
                return x;
            },
            _getTransform:function(m,rx,ry){
                return {
                    tx:this._gauss(3,m,rx),
                    ty:this._gauss(3,m,ry)
                };
            },
            //多元线性回归
            _linearRegression:function(/*方程矩阵(非增广矩阵)*/ma,/*结果矩阵*/mb){
                var N = 0;		// number of data points entered
                var maxN = ma.length;	// maximum number of data points possible
                var M = ma[0].length; 		// number of independent variables
                var X = new makeArray2(M, maxN);
                var Y = [];
                var abort = false;

                var regrCoeff = [];

                function makeArray2 (X,Y)
                {
                    this.length = X+1;
                    for (var count = 0; count <= X+1; count++)
                        // to allow starting at 1
                        this[count] = new makeArray(Y);
                }

                function makeArray (Y)
                {
                    this.length = Y+1;
                    for (var count = 0; count <= Y+1; count++)
                        this[count] = 0;
                }

                function det(A)
                {
                    var Length = A.length-1;
                    // formal length of a matrix is one bigger
                    if (Length == 1) return (A[1][1]);
                    else
                    {
                        var i;
                        var sum = 0;
                        var factor = 1;
                        for (var i = 1; i <= Length; i++)
                        {
                            if (A[1][i] != 0)
                            {
                                // create the minor
                                var minor = new makeArray2(Length-1,Length-1);
                                var m;
                                var n;
                                var theColumn;
                                for (var m = 1; m <= Length-1; m++) // columns
                                {
                                    if (m < i) theColumn = m;
                                    else theColumn = m+1;
                                    for (var n = 1; n <= Length-1; n++)
                                    {
                                        minor[n][m] = A[n+1][theColumn];
                                    } // n
                                } // m
                                // compute its determinant
                                sum = sum + A[1][i]*factor*det(minor);
                            }
                            factor = -factor;	// alternating sum
                        } // end i
                    } // recursion
                    return(sum);
                } // end determinant

                function inverse(A) {
                    var Length = A.length - 1;
                    var B = new makeArray2(Length, Length);  // inverse
                    var d = det(A);
                    if (d == 0) alert("singular matrix--check data");
                    else
                    {
                        var i;
                        var j;
                        for (var i = 1; i <= Length; i++)
                        {
                            for (var j = 1; j <= Length; j++)
                            {
                                // create the minor
                                var minor = new makeArray2(Length-1,Length-1);
                                var m;
                                var n;
                                var theColumn;
                                var theRow;
                                for (var m = 1; m <= Length-1; m++) // columns
                                {
                                    if (m < j) theColumn = m;
                                    else theColumn = m+1;
                                    for (var n = 1; n <= Length-1; n++)
                                    {
                                        if (n < i) theRow = n;
                                        else theRow = n+1;
                                        minor[n][m] = A[theRow][theColumn];
                                    } // n
                                } // m
                                // inverse entry
                                var temp = (i+j)/2;
                                var factor;
                                if (temp == Math.round(temp)) factor = 1;
                                else factor = -1;
                                B[j][i] =  det(minor)*factor/d;
                            } // j

                        } // end i
                    } // recursion
                    return(B);
                } // end inverse

                function buildxy()  {
                    abort = false;
                    N = 0;
                    for(var i=0;i<ma.length;i++){
                        N++;
                        for(var k=1;k<=M;k++){
                            X[k][N]=ma[i][k-1];
                        }
                        Y[i+1]=mb[i];
                    }
                }

                function linregr()
                {
                    if (!abort) {
                        var k;
                        var i;
                        var j;
                        var sum;

                        var B = new makeArray(M+1);
                        var P = new makeArray2(M+1, M+1);
                        var invP = new makeArray2(M+1, M+1);
                        var mtemp = M+1;
                        // First define the matrices B and P
                        for (i = 1; i <=  N; i++) X[0][i] = 1;
                        for (i = 1; i <= M+1; i++)
                        {
                            sum = 0;
                            for (k = 1; k <= N; k++) sum = sum + X[i-1][k]*Y[k];
                            B[i] = sum;

                            for (j = 1; j <= M+1; j++)
                            {
                                sum = 0;
                                for (k = 1; k <= N; k++) sum = sum + X[i-1][k]*X[j-1][k];
                                P[i][j] = sum;
                            }
                        } // i

                        invP = inverse(P);
                        for (k = 0; k <= M; k++)
                        {
                            sum = 0;
                            for (j = 1; j <= M+1; j++)
                            {
                                sum = sum + invP[k+1][j]*B[j];
                            } // j
                            regrCoeff[k] = sum;
                        } // k
                    } // end of if not abort
                }

                function calc(){
                    buildxy();
                    linregr();
                    var result=[];
                    for(var i=1;i<=M;i++)result.push(regrCoeff[i]);
                    result.push(regrCoeff[0]);
                    return result;
                }

                return calc();
            },
            //通过3点确认数值坐标与实际坐标的变换矩阵
            _setTransform:function(){
                if(arguments.length==3){
                    var pointMap1=arguments[0],pointMap2=arguments[1],pointMap3=arguments[2];
                    var c2d=this._getTransform(
                        [[pointMap1.cx,pointMap1.cy,1],[pointMap2.cx,pointMap2.cy,1],[pointMap3.cx,pointMap3.cy,1]],
                        [pointMap1.dx,pointMap2.dx,pointMap3.dx],
                        [pointMap1.dy,pointMap2.dy,pointMap3.dy]
                    );
                    for(var i=0;i<3;i++){
                        if(isNaN(c2d.tx[i]) || isNaN(c2d.ty[i])){
                            throw "给定的点无法确定变换关系";
                        }
                    }
                    var d2c=this._getTransform(
                        [[pointMap1.dx,pointMap1.dy,1],[pointMap2.dx,pointMap2.dy,1],[pointMap3.dx,pointMap3.dy,1]],
                        [pointMap1.cx,pointMap2.cx,pointMap3.cx],
                        [pointMap1.cy,pointMap2.cy,pointMap3.cy]
                    );
                    this._txC2D=c2d.tx;this._tyC2D=c2d.ty;
                    this._txD2C=d2c.tx;this._tyD2C=d2c.ty;
                }
                else if(arguments.length>3){
                    this._txC2D = this._linearRegressionMap(arguments,"cx","cy","dx");
                    this._tyC2D = this._linearRegressionMap(arguments,"cx","cy","dy");
                    this._txD2C = this._linearRegressionMap(arguments,"dx","dy","cx");
                    this._tyD2C = this._linearRegressionMap(arguments,"dx","dy","cy");
                }
            },
            _linearRegressionMap:function(data,fxn1,fxn2,tn){
                var ma=[];
                var ra = [];
                for(var i=0;i<data.length;i++){
                    var p = data[i];
                    ma.push([p[fxn1], p[fxn2]]);
                    ra.push([p[tn]]);
                }
                return this._linearRegression(ma,ra);
            },
            toCore:function(p){
                if(!this._txD2C){
                    p.x= p.dx;
                    p.y= p.dy;
                    return;
                }
                p.x=this._txD2C[0]* p.dx+this._txD2C[1]* p.dy+this._txD2C[2];
                p.y=this._tyD2C[0]* p.dx+this._tyD2C[1]* p.dy+this._tyD2C[2];
            },
            toDisplay:function(p){
                if(!this._txC2D){
                    p.dx= p.x;
                    p.dy= p.y;
                    return;
                }
                p.dx=this._txC2D[0]* p.x+this._txC2D[1]* p.y+this._txC2D[2];
                p.dy=this._tyC2D[0]* p.x+this._tyC2D[1]* p.y+this._tyC2D[2];
            },
            _setTransformConfig:function(opts){
                if(opts.PointMaps.length>=3){
                    this._setTransform.apply(this,opts.PointMaps);
                }
            }
        },
        Rotate:{
            Angle:0,
            MinX:0,
            MaxY:0,
            FirstZoomPixelRatioX:0,
            FirstZoomPixelRatioY:0,

            MinY:0,
            toCore:function(p){
                if(this.Angle==0){
                    p.x= p.dx;
                    p.y= p.dy;
                    return;
                }
                var dx= p.dx-this.MinX,dy= p.dy-this.MaxY;
                var nx = dx * this._cos - dy * this._sin;
                var ny = dx * this._sin + dy * this._cos;
                p.x= nx+this.MinX;
                p.y= ny+this.MaxY;
            },
            toDisplay:function(p){
                if(this.Angle==0){
                    p.dx= p.x;
                    p.dy= p.y;
                    return;
                }
                var dx= p.x-this.MinX,dy= p.y-this.MaxY;
                var nx = dx * this._cos - dy * (-this._sin);
                var ny = dx * (-this._sin) + dy * this._cos;
                p.dx= nx+this.MinX;
                p.dy= ny+this.MaxY;
            },
            _setRotate:function(opts){
                this.FirstZoomPixelRatioX=opts.FirstZoomPixelRatioX;
                this.FirstZoomPixelRatioY=opts.FirstZoomPixelRatioY;
                this.MinX=opts.MinX;
                this.MaxY=opts.MaxY;
                HTMap.mapConfig.FullExtent=new HTMap.Bound(
                    this.MinX*1e16,
                    (HTMap.mapConfig.FirstZoomTileCols*HTMap.mapConfig.TileSize*this.FirstZoomPixelRatioX+this.MinX)*1e16,
                    (this.MinY=this.MaxY-HTMap.mapConfig.FirstZoomTileRows*HTMap.mapConfig.TileSize*this.FirstZoomPixelRatioY)*1e16,
                    this.MaxY*1e16
                );
                this.Angle=Math.PI / 180 * opts.Angle;
                this._cos=Math.cos(this.Angle);
                this._sin=Math.sin(this.Angle);
            },
            _cos:0,
            _sin:0
        },
        _scoord: function () {
            var coordps = [];
            window._coordps = coordps;
            var zoom = new HTMap.Zoom(map.getZoom());
            var w = zoom.tileCols * this.mapConfig.TileSize;
            var h = zoom.tileRows * this.mapConfig.TileSize;
            var cxy;
            this._rcoord = function (x, y) {
                cxy = { x: x, y: y }
                console.log("saved. click map");
            }
            map.addEventListener("click", function (e) {
                if (cxy) {
                    var c = e.point;
                    var px = Util.Projection.FromLatLngToPixel(c.x * 1e16, c.y * 1e16, zoom);
                    coordps.push({ px: px, point: { x: cxy.x, y: cxy.y } });
                    console.log("saved point " + coordps.length + " call _fcinrbyps() get result");
                }
                cxy = null;
            });
            this._fcinrbyps = function (aps) {
                if (cxy) { console.log("has point not click");return;}
                coordps = aps || coordps;
                var minxsum = 0, maxxsum = 0, minysum = 0, maxysum = 0, xcount = 0, ycount = 0;
                for (var i = 0, j = coordps.length; i < j; i++) {
                    var p = coordps[i];
                    for (var k = 0, l = coordps.length; k < l; k++) {
                        if (k == i) continue;
                        var p2 = coordps[k];
                        var dxp = p.px.x - p2.px.x;
                        var dyp = p.px.y - p2.px.y;
                        var dxl = p.point.x - p2.point.x;
                        var dyl = p.point.y - p2.point.y;
                        if (dxp != 0) {
                            var kx = dxl / dxp;
                            xcount++;
                            var minx = p2.point.x - kx * p2.px.x;
                            var maxx = p2.point.x + (w - p2.px.x) * kx;
                            minxsum += minx;
                            maxxsum += maxx;
                        }
                        if (dyp != 0) {
                            var ky = -dyl / dyp;
                            ycount++;
                            var miny = p2.point.y - (h - p2.px.y) * ky;
                            var maxy = p2.point.y + p2.px.y * ky;
                            minysum += miny;
                            maxysum += maxy;
                        }
                    }
                }
                return {
                    minx: minxsum / xcount,
                    maxx: maxxsum / xcount,
                    miny: minysum / ycount,
                    maxy: maxysum / ycount
                };
            }

            console.log("start config coord;call _rcoord(x,y) and click map");
        },
        _pixelCoord:function(lnglats/*{lng,lat,dlng,dlat}*/){

        },
        setMapConfig: function (opts) {
            Util.setOptionsValue(this.mapConfig, opts, this.mapConfig);
            var errorList = [];
            if (!this.mapConfig.MaxZoomLevel) {
                errorList.push("未设置地图最大可缩放级别MaxZoomLevel");
            }
            if (!this.mapConfig.MinZoomLevel && this.mapConfig.MinZoomLevel != 0) {
                errorList.push("未设置地图最小可缩放级别MaxZoomLevel");
            }
            if (!this.mapConfig.FullExtent) {
                errorList.push("未设置地图坐标范围FullExtent(类型:HTMap.Bound)");
            }
            if (!this.mapConfig.CoordSys) {
                errorList.push("未设置地图坐标类型(类型:HTMap.CoordSys枚举)");
            }
            if (errorList.length) {
                throw errorList.join(";");
            }
            if (null == this.mapConfig.DefaultLevel) {
                this.mapConfig.DefaultLevel = this.mapConfig.MinZoomLevel;
            }
            if (this.mapConfig.CoordSys == this.CoordSys.GOOGLE) {
                Util.Projection = HTMap.googleProjection;
            }
            else if (this.mapConfig.CoordSys == this.CoordSys.RECTANGULAR) {
                Util.Projection = HTMap.rectangularProjection;
            }
            if(opts.CoordFixed)this.mapConfig.CoordFixed = opts.CoordFixed;
            if(opts.TransformConfig)this.Transform._setTransformConfig(opts.TransformConfig);
        }
    };

Util = new Object();

Util.isIE = !+[1, ];
Util.isMobile=navigator && navigator.userAgent && (
        navigator.userAgent.indexOf("Android")>=0 ||
        navigator.userAgent.indexOf("iPhone")>=0 ||
        navigator.userAgent.indexOf("Windows Phone")>=0 ||
        navigator.userAgent.indexOf("iPad")>=0 ||
        navigator.userAgent.indexOf("iPod")>=0
    );

Util.createUniqueID = function (prefix) {
    if (prefix == null) {
        prefix = "id_";
    }
    return prefix + Math.round(Math.random() * 10000000);
};

Util.getValueOfNoPX = function (valueString) {
    if (!valueString)
        return;
    if (valueString.indexOf("px")) {
        var i = valueString.indexOf("px");
        return Number(valueString.substring(0, i));
    }
    return Number(valueString);
}

Util.getRealMapWidth = function (fullExtent) {
    return Util.distanceByLnglat(fullExtent.getMinX() / 1e16, fullExtent.getMaxY() / 1e16, fullExtent.getMaxX() / 1e16, fullExtent.getMaxY() / 1e16);
}

Util.getRealMapHeight = function (fullExtent) {
    return Util.distanceByLnglat(fullExtent.getMinX() / 1e16, fullExtent.getMinY() / 1e16, fullExtent.getMinX() / 1e16, fullExtent.getMaxY() / 1e16);
}

Util.getRealMapBound = function (fullExtent, level) {
    //获取当前级别地图的比例尺
    var scale = Util.zoomScale(level);

    var xmin = fullExtent.getMinX() / 1e16;
    var xmax = fullExtent.getMaxX() / 1e16;
    var ymin = fullExtent.getMinY() / 1e16;
    var ymax = fullExtent.getMaxY() / 1e16;

    //瓦片的长度
    var tileWidth = HTMap.mapConfig.TileSize / 96 * 2.54 * scale / 100;
    var cols = Util.getRealMapWidth(fullExtent) / tileWidth; // double
    var rows = (ymax - ymin) / ((xmax - xmin) / cols);
    xmax = (xmax - xmin) / cols * Math.ceil(cols) + xmin;
    ymin = ymax - (ymax - ymin) / rows * Math.ceil(rows);
    return new HTMap.Bound(xmin * 1e16, xmax * 1e16, ymin * 1e16, ymax * 1e16);
}
/*球面算法======*/
Util.distanceByLnglat = function (lng1, lat1, lng2, lat2) {
    var radLat1 = Util.Rad(lat1);
    var radLat2 = Util.Rad(lat2);
    var a = radLat1 - radLat2;
    var b = Util.Rad(lng1) - Util.Rad(lng2);
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
    s = s * 6378137.0;// 取WGS84标准参考椭球中的地球长半径(单位:m)
    s = Math.round(s * 10000) / 10000;
    return s;
}

Util.calcArea = function(points,MapUnits) {
    var PointX=[],PointY=[];
    MapUnits = MapUnits || "DEGREES";
    //此算法要求不能有相邻的点相同
    for(var i= 0,j=points.length;i<j;i++){
        var k = i+1;
        if(k>=j)k=0;
        var x = points[i].x;
        var y = points[i].y;
        var kx = points[k].x;
        var ky = points[k].y;
        if(x==kx && y==ky)continue;
        PointX.push(x);
        PointY.push(y);
    }
    var Count = PointX.length
    if (Count>2) {
        var mtotalArea = 0;
        if (MapUnits=="DEGREES")//经纬度坐标下的球面多边形
        {
            var LowX=0.0;
            var LowY=0.0;
            var MiddleX=0.0;
            var MiddleY=0.0;
            var HighX=0.0;
            var HighY=0.0;

            var AM = 0.0;
            var BM = 0.0;
            var CM = 0.0;

            var AL = 0.0;
            var BL = 0.0;
            var CL = 0.0;

            var AH = 0.0;
            var BH = 0.0;
            var CH = 0.0;

            var CoefficientL = 0.0;
            var CoefficientH = 0.0;

            var ALtangent = 0.0;
            var BLtangent = 0.0;
            var CLtangent = 0.0;

            var AHtangent = 0.0;
            var BHtangent = 0.0;
            var CHtangent = 0.0;

            var ANormalLine = 0.0;
            var BNormalLine = 0.0;
            var CNormalLine = 0.0;

            var OrientationValue = 0.0;

            var AngleCos = 0.0;

            var Sum1 = 0.0;
            var Sum2 = 0.0;
            var Count2 = 0;
            var Count1 = 0;


            var Sum = 0.0;
            var Radius = 6378137.0;

            for(i=0;i<Count;i++)
            {
                if(i==0)
                {
                    LowX = PointX[Count-1] * Math.PI / 180;
                    LowY = PointY[Count-1] * Math.PI / 180;
                    MiddleX = PointX[0] * Math.PI / 180;
                    MiddleY = PointY[0] * Math.PI / 180;
                    HighX = PointX[1] * Math.PI / 180;
                    HighY = PointY[1] * Math.PI / 180;
                }
                else if(i==Count-1)
                {
                    LowX = PointX[Count-2] * Math.PI / 180;
                    LowY = PointY[Count-2] * Math.PI / 180;
                    MiddleX = PointX[Count-1] * Math.PI / 180;
                    MiddleY = PointY[Count-1] * Math.PI / 180;
                    HighX = PointX[0] * Math.PI / 180;
                    HighY = PointY[0] * Math.PI / 180;
                }
                else
                {
                    LowX = PointX[i-1] * Math.PI / 180;
                    LowY = PointY[i-1] * Math.PI / 180;
                    MiddleX = PointX[i] * Math.PI / 180;
                    MiddleY = PointY[i] * Math.PI / 180;
                    HighX = PointX[i+1] * Math.PI / 180;
                    HighY = PointY[i+1] * Math.PI / 180;
                }

                AM = Math.cos(MiddleY) * Math.cos(MiddleX);
                BM = Math.cos(MiddleY) * Math.sin(MiddleX);
                CM = Math.sin(MiddleY);
                AL = Math.cos(LowY) * Math.cos(LowX);
                BL = Math.cos(LowY) * Math.sin(LowX);
                CL = Math.sin(LowY);
                AH = Math.cos(HighY) * Math.cos(HighX);
                BH = Math.cos(HighY) * Math.sin(HighX);
                CH = Math.sin(HighY);


                CoefficientL = (AM*AM + BM*BM + CM*CM)/(AM*AL + BM*BL + CM*CL);
                CoefficientH = (AM*AM + BM*BM + CM*CM)/(AM*AH + BM*BH + CM*CH);
                ALtangent = CoefficientL * AL - AM;
                BLtangent = CoefficientL * BL - BM;
                CLtangent = CoefficientL * CL - CM;
                AHtangent = CoefficientH * AH - AM;
                BHtangent = CoefficientH * BH - BM;
                CHtangent = CoefficientH * CH - CM;


                AngleCos = (AHtangent * ALtangent + BHtangent * BLtangent + CHtangent * CLtangent)/(Math.sqrt(AHtangent * AHtangent + BHtangent * BHtangent +CHtangent * CHtangent) * Math.sqrt(ALtangent * ALtangent + BLtangent * BLtangent +CLtangent * CLtangent));

                AngleCos = Math.acos(AngleCos);

                ANormalLine = BHtangent * CLtangent - CHtangent * BLtangent;
                BNormalLine = 0 - (AHtangent * CLtangent - CHtangent * ALtangent);
                CNormalLine = AHtangent * BLtangent - BHtangent * ALtangent;

                if(AM!=0)
                    OrientationValue = ANormalLine/AM;
                else if(BM!=0)
                    OrientationValue = BNormalLine/BM;
                else
                    OrientationValue = CNormalLine/CM;

                if(OrientationValue>0)
                {
                    Sum1 += AngleCos;
                    Count1 ++;

                }
                else
                {
                    Sum2 += AngleCos;
                    Count2 ++;
                    //Sum +=2*Math.PI-AngleCos;
                }
            }

            if(Sum1>Sum2){
                Sum = Sum1+(2*Math.PI*Count2-Sum2);
            }
            else{
                Sum = (2*Math.PI*Count1-Sum1)+Sum2;
            }

            //平方米
            mtotalArea = (Sum-(Count-2)*Math.PI)*Radius*Radius;
        }
        else { //非经纬度坐标下的平面多边形

            var i,j;
            var j;
            var p1x,p1y;
            var p2x,p2y;
            for(i=Count-1, j=0; j<Count; i=j, j++)
            {

                p1x = PointX[i];
                p1y = PointY[i];

                p2x = PointX[j];
                p2y = PointY[j];

                mtotalArea +=p1x*p2y-p2x*p1y;
            }
            mtotalArea /= 2.0;
        }
        return mtotalArea;
    }
    return 0;
}

Util.distanceOfLngLat = function(lng,lat){
    var dx = Util.distanceByLnglat(HTMap.mapConfig.FullExtent.getMinX()/1e16,lat,HTMap.mapConfig.FullExtent.getMaxX()/1e16,lat);
    var dy = Util.distanceByLnglat(lng,HTMap.mapConfig.FullExtent.getMinY()/1e16,lng,HTMap.mapConfig.FullExtent.getMaxY()/1e16);
    var kx = (HTMap.mapConfig.FullExtent.getMaxX()-HTMap.mapConfig.FullExtent.getMinX())/dx;
    var ky = (HTMap.mapConfig.FullExtent.getMaxY()-HTMap.mapConfig.FullExtent.getMinY())/dy;
    return {
        lng : kx/1e16,
        lat : ky/1e16
    };
}

Util.isMovedMapBoundOut=function(map,movedx,movedy){
    if(!HTMap.mapConfig.AreaRestriction) return {leftOut:false,rightOut:false,topOut:false,bottomOut:false};
    var ob = map.getBounds();
    var z = map.model.getZoom();
    //直角坐标算法
    var kx = (z.realMapBound.getMaxX()- z.realMapBound.getMinX())/(z.tileCols*HTMap.mapConfig.TileSize);
    var ky = (z.realMapBound.getMaxY()- z.realMapBound.getMinY())/(z.tileRows*HTMap.mapConfig.TileSize);
    var dcx = -kx*movedx,dcy=ky*movedy;
    var minx = ob.getMinX()+dcx,maxx = ob.getMaxX()+dcx;
    var miny = ob.getMinY()+dcy,maxy = ob.getMaxY()+dcy;
    return {
        leftOut:minx< HTMap.mapConfig.AreaRestriction.getMinX(),
        rightOut:maxx> HTMap.mapConfig.AreaRestriction.getMaxX(),
        topOut:maxy> HTMap.mapConfig.AreaRestriction.getMaxY(),
        bottomOut:miny< HTMap.mapConfig.AreaRestriction.getMinY()
    };
}

Util.lngByDistance = function (latitude, distance) {
    var r = Math.cos(latitude * (Math.PI / 180)) * 2 * Math.PI * 6378137.0;
    return distance / r * 360;
}
/*球面算法======*/

Util.getGroundResolution = function (zoom, latitude) {
    return Util.Projection.getGroundResolution(zoom, latitude);
}

Util.Rad = function (d) {
    return d * Math.PI / 180.0;
}

Util.createDivByOpts = function (opts) {
    opts = opts || {};
    if (opts.id && document.getElementById(opts.id)) return document.getElementById(opts.id);
    var e = document.createElement("div");
    if (opts.id) e.id = opts.id;
    if (opts.className) e.setAttribute("class", opts.className);
    if (opts.left) e.style.left = parseInt(opts.left) + "px";
    if (opts.top) e.style.top = parseInt(opts.top) + "px";
    if (opts.innerHTML) e.innerHTML = opts.innerHTML;
    if (opts.position) e.style.position = opts.position;
    if (opts.border) e.style.border = opts.border;
    if (opts.opacity) {
        e.style.opacity = opts.opacity;
        e.style.filter = 'alpha(opacity=' + (opts.opacity * 100) + ')';
    }
    if (opts.width) e.style.width = parseInt(opts.width) + "px";
    if (opts.height) e.style.height = parseInt(opts.height) + "px";
    return e;
}

Util.createDiv = function (id, left, top, width, height, img, position, border, opacity, innerHTML) {
    if (document.getElementById(id)) {
        return document.getElementById(id);
    }
    var e = document.createElement('div');
    if (id)
        e.id = id;

    if (left)
        e.style.left = parseInt(left) + "px";
    if (top)
        e.style.top = parseInt(top) + "px";

    if (width && height) {
        e.style.width = parseInt(width) + "px";
        e.style.height = parseInt(height) + "px";
    }
    if (img)
        e.appendChild(Util.createImg(id + '_Img', 5, 5, null, null, img, 'relative'));
    if (innerHTML)
        e.innerHTML = innerHTML;
    if (position)
        e.style.position = position;
    if (border)
        e.style.border = border;

    if (opacity) {
        e.style.opacity = opacity;
        e.style.filter = 'alpha(opacity=' + (opacity * 100) + ')';
    }

    return e;
};

Util.createDiv2 = function (id, width, height, name, altinfo) {
    if (document.getElementById(id)) {
        return document.getElementById(id);
    }
    var e = document.createElement('div');
    if (id)
        e.id = id;

    if (width && height) {
        e.style.width = parseInt(width) + "px";
        e.style.height = parseInt(height) + "px";
    }

    e.style.styleFloat = "left";
    e.style.float = "right";

    if (name)
        e.appendChild(Util.createFont(id, name, altinfo));


    return e;
};

Util.createAbsoluteClassDiv = function (className) {
    var div = document.createElement("div");
    div.style.position = "absolute";
    div.className = className;
    return div;
}

Util.createFont = function (id, name, altinfo) {
    var A = document.createElement("A");

    A.style.fontSize = "13px";
    A.style.color = "#FFFFFF";
    A.style.cursor = "hand";
    A.title = altinfo;
    A.innerText = name;
    A.style.textDecoration = "underline";
    //A.style.title = id;
    //A.setAttribute("href","#"); 
    //A.appendChild(document.createTextNode("一些文字")); 

    return A
}

Util.createImg = function (id, left, top, width, height, imgurl, position, border, opacity, delayDisplay) {

    image = document.createElement("img");

    if (delayDisplay) {
        image.style.display = "none";
        Event.observe(image, "load", Util.onImageLoad.bindAsEventListener(image));
        Event.observe(image, "error", Util.onImageLoadError.bindAsEventListener(image));
    }

    image.style.alt = id;
    image.galleryImg = "no";
    if (imgurl)
        image.src = imgurl;

    if (!position)
        position = "relative";

    if (id)
        image.id = id;

    if (left)
        image.style.left = parseInt(left) + "px";
    if (top)
        image.style.top = parseInt(top) + "px";

    if (width && height) {
        image.style.width = parseInt(width) + "px";
        image.style.height = parseInt(height) + "px";
    }

    if (position)
        image.style.position = position;

    if (border)
        image.style.border = border;

    if (opacity) {
        image.style.opacity = opacity;
        image.style.filter = 'alpha(opacity=' + (opacity * 100) + ')';
    }

    return image;
}

Util.setElementStyle = function (element, id, left, top, width, height, position, border, overflow, opacity) {

    if (id) {
        element.id = id;
    }

    if (left)
        element.style.left = parseInt(left) + "px";
    if (top)
        element.style.top = parseInt(top) + "px";

    if (width && height) {
        element.style.width = parseInt(width) + "px";
        element.style.height = parseInt(height) + "px";
    }
    if (position) {
        element.style.position = position;
    }
    if (border) {
        element.style.border = border;
    }
    if (overflow) {
        element.style.overflow = overflow;
    }
    if (opacity) {
        element.style.opacity = opacity;
        element.style.filter = 'alpha(opacity=' + (opacity * 100) + ')';
    }
};

Util.onImageLoad = function () {
    this.style.backgroundColor = null;
    this.style.display = "";
};

Util.onImageLoadError = function () {
    this.style.backgroundColor = "pink";
    this.style.display = "";
};

//得到当前鼠标点击处的屏幕坐标
Util.getMousePixel = function (e) {
    if (!e)
        e = window.event;
    if (!e.pageX)
        e.pageX = e.clientX;
    if (!e.pageY)
        e.pageY = e.clientY;
    return { x: e.pageX, y: e.pageY };
};

Util.getMouseRelativePixel = function (e, mapDiv) {
    var pixel = Util.getMousePixel(e);
    var relDeltaX = pixel.x - Util.getLeft(mapDiv.parentNode) - Util.getValueOfNoPX(mapDiv.style.left);
    var relDeltaY = pixel.y - Util.getTop(mapDiv.parentNode) - Util.getValueOfNoPX(mapDiv.style.top);
    return { x: relDeltaX, y: relDeltaY }
};

Util.getTop = function (obj) {
    var t = obj.offsetTop;
    while (obj = obj.offsetParent) {
        t += obj.offsetTop;
    }
    return t;
};

Util.getLeft = function (obj) {
    var t = obj.offsetLeft;
    while (obj = obj.offsetParent) {
        t += obj.offsetLeft;
    }
    return t;
};

Util.getStyleWidthOrClientWidth = function (element) {
    if (element.style.width) {
        return Util.getValueOfNoPX(element.style.width);
    }
    else if (element.clientWidth) {
        return element.clientWidth;
    }
    return 0;
}
Util.getStyleHeightOrClientHeight = function (element) {
    if (element.style.height) {
        return Util.getValueOfNoPX(element.style.height);
    }
    else if (element.clientHeight) {
        return element.clientHeight;
    }
    return 0;
}

Util.MapCurrentOffset = { x: 0, y: 0 };

//获取指定坐标位置的像素坐标（偏移后的覆盖物坐标）
Util.getScreenPixel = function (coord, zoom) {
    var p = Util.Projection.FromLatLngToPixel(coord.x, coord.y, zoom);
    return { x: p.x - Util.MapCurrentOffset.x, y: p.y - Util.MapCurrentOffset.y }
}

//获取指定坐标位置的像素坐标（没有偏移的覆盖物坐标）
Util.getScreenPixelEx = function (coord, zoom) {
    return Util.Projection.FromLatLngToPixel(coord.x, coord.y, zoom);
}

//原始的获取坐标的代码,此函数输入参数为覆盖物的坐标（相对地图DIV的位置）
Util.getCoordinateByPixel = function (pixel, zoom) {
    return Util.Projection.FromPixelToLatLng(pixel.x + Util.MapCurrentOffset.x, pixel.y + Util.MapCurrentOffset.y, zoom);
};

//修改的获取坐标的代码，只在右键标注调用,该函数作用于屏幕绝对坐标
Util.getCoordinateByPixel2 = function (pixel, zoom, map) {
    var mapDiv = map.mapControl.mapDiv;
    var relDeltaX = pixel.x - Util.getLeft(mapDiv.parentNode) - Util.getValueOfNoPX(mapDiv.style.left || mapDiv.clientLeft + 'px');
    var relDeltaY = pixel.y - Util.getTop(mapDiv.parentNode) - Util.getValueOfNoPX(mapDiv.style.top || mapDiv.clientTop + 'px');
    var c = Util.Projection.FromPixelToLatLng(relDeltaX + Util.MapCurrentOffset.x, relDeltaY + Util.MapCurrentOffset.y, zoom);
    c.Pixel = { x: relDeltaX, y: relDeltaY };
    return c;
};

//根据偏移过的像素坐标获取瓦片索引
Util.getTileXYByPixel = function (pixel) {
    return {
        x: Math.floor((pixel.x + Util.MapCurrentOffset.x) / HTMap.mapConfig.TileSize),
        y: Math.floor((pixel.y + Util.MapCurrentOffset.y) / HTMap.mapConfig.TileSize)
    }
}

//根据瓦片索引获取偏移后的瓦片像素位置
Util.getPixelByTileXY = function (x, y) {
    return {
        x: x * HTMap.mapConfig.TileSize - Util.MapCurrentOffset.x,
        y: y * HTMap.mapConfig.TileSize - Util.MapCurrentOffset.y
    }
}

Util.getAbsoluteLeft = function (o) {
    oLeft = o.offsetLeft
    while (o.offsetParent != null) {
        oParent = o.offsetParent
        oLeft += oParent.offsetLeft
        o = oParent
    }
    return oLeft
}

Util.getAbsoluteTop = function (o) {
    oTop = o.offsetTop;
    while (o.offsetParent != null) {
        oParent = o.offsetParent
        oTop += oParent.offsetTop  // Add parent top position
        o = oParent
    }
    return oTop
}

/**
 * 给对象添加自定义事件机制
 * @param {*} obj
 */
Util.setClassEvent = function (obj) {
    obj.Events = {};
    obj._pauseEvents = {};
    obj._FutureEvent = {};
    //定义添加事件的方法
    obj.addEventListener = function (eventName, handler) {
        if(this._FutureEvent["Event_" + eventName]){
            handler(this._FutureEvent["Event_" + eventName].args);
        }
        if (!this.Events) return;
        if (!this.Events["Event_" + eventName]) {
            this.Events["Event_" + eventName] = [];
        }
        this.Events["Event_" + eventName].push(handler);
    };
    //定义触发事件的方法
    obj.triggerEvent = function (eventName, args) {
        if (!this.Events) return true;
        var events = this.Events["Event_" + eventName]
        if (events) {
            if (this._pauseEvents[eventName] && this._pauseEvents[eventName] > 0) {
                this._pauseEvents[eventName]--;
                return true;
            }
            for (var i = 0; i < events.length; i++) {
                /*事件处理函数可以通过返回false来终止事件的执行并将此值返回给触发事件的代码*/
                if (events[i](args) == false) return false;
            }
        }
        return true;//返回true表示没有事件处理函数或者所有的事件处理函数完成了处理
    }
    //适合只触发一次，但有可能在用户订阅事件之前就被触发的事件
    obj.triggerEventOrFutureOnce = function(eventName, args){
        var events = this.Events["Event_" + eventName]
        if (events) {
            if (this._pauseEvents[eventName] && this._pauseEvents[eventName] > 0) {
                this._pauseEvents[eventName]--;
                return true;
            }
            for (var i = 0; i < events.length; i++) {
                /*事件处理函数可以通过返回false来终止事件的执行并将此值返回给触发事件的代码*/
                if (events[i](args) == false) return false;
            }
        }
        this._FutureEvent["Event_" + eventName]= {args:args};
        return true;
    }
    //定义移除事件的方法
    obj.removeEventListener = function (eventName, handler) {
        if (!this.Events) return;
        var e = this.Events["Event_" + eventName];
        if (e) {
            for (var i = 0; i < e.length; i++) {
                if (e[i] == handler) {
                    e.splice(i, 1);
                    return;
                }
            }
        }
    }
    //定义暂时阻止一次指定事件的方法
    obj.pauseEvent = function (eventName) {
        this._pauseEvents[eventName] = 1;
    }
}

/**
 * 给对象设置选项成员的值
 * @param {*} classObj
 * @param {*} opts
 * @param {*} defaultOpts
 */
Util.setOptionsValue = function (classObj, opts, defaultOpts) {
    opts = opts || {};
    for (var p in opts) {
        classObj[p] = opts[p];
    }
    if (!defaultOpts) return;
    for (var p in defaultOpts) {
        if (typeof (opts[p]) != "undefined") continue;
        classObj[p] = defaultOpts[p];
    }
}

Util.funs = {
    index: 400,
    getFocus: function (target) {
        if (target.style.zIndex != this.index) {
            this.index += 2;
            var idx = this.index;
            target.style.zIndex = idx;
        }
    },
    freeFocus: function (target) {
        if (target.style.zIndex == this.index) {
            target.style.zIndex = this.index;
            this.index = 400;
        }
    },
    abs: function (element) {
        var result = { x: element.offsetLeft, y: element.offsetTop };
        element = element.offsetParent;
        while (element) {
            result.x += element.offsetLeft;
            result.y += element.offsetTop;
            element = element.offsetParent;
        }
        return result;
    }
};

/**
 * 使指定的元素上的鼠标移动事件，可以移动指定的元素位置(注意被移动的元素必须先设置有top和left值)
 * @param {object} source
 * @param {*} opts
 */
Util.setElementDrag = function (source, opts) {
    if (source._enableDragging) return;
    if (source._enableDragging != null) {
        source._enableDragging = true;
        return;
    }
    opts = opts || {
            target: null,
            startDrag: function (e, x, y) { },
            dragging: function (e, x, y) { },
            endDrag: function () { }
        };
    var target = opts.target || source;
    var x0 = 0, y0 = 0, moveable = false, NS = (navigator.appName == 'Netscape');
    var x1, y1;
    //可设置该div是否可拖动
    source.setEnableDragging = function (enable) {
        if (!enable) moveable = false;
        this._enableDragging = enable;
        if (opts.endDrag && !enable && moveable) opts.endDrag(target);
    }
    source.setEnableDragging(true);
    Event.observe(source, 'mousedown', function (e) {
        if (!source._enableDragging) return;
        e = e ? e : (window.event ? window.event : null);
        Util.funs.getFocus(target);
        if (e.button == (NS) ? 0 : 1) {
            if (!NS) { e.srcElement.setCapture() }
            x0 = e.clientX;
            y0 = e.clientY;
            x1 = Util.getValueOfNoPX(target.style.left);
            y1 = Util.getValueOfNoPX(target.style.top);
            moveable = true;
            if (opts.startDrag) opts.startDrag(target, x1, y1);
        }
    });
    //拖动;
    Event.observe(source, 'mousemove', function (e) {
        if (!source._enableDragging) return;
        e = e ? e : (window.event ? window.event : null);
        if (moveable) {
            target.style.left = (x1 + e.clientX - x0) + "px";
            target.style.top = (y1 + e.clientY - y0) + "px";
            if (opts.dragging) opts.dragging(target, x1 + e.clientX - x0, y1 + e.clientY - y0);
        }
    });
    //停止拖动;
    Event.observe(source, 'mouseup', function (e) {
        if (!source._enableDragging) return;
        if (moveable) {
            Util.funs.freeFocus(target);
            if (!NS) { e.srcElement.releaseCapture(); }
            moveable = false;
            if (opts.endDrag) opts.endDrag(target);
        }
    });
}

/**
 * 检测指定的元素是否包含指定的class
 * @param element
 * @param className
 * @return {Boolean}
 */
Util.hasClass = function (element, className) {
    var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
    return element.className.match(reg);
}

/**
 * 给元素添加class
 * @param element
 * @param className
 */
Util.addClass = function (element, className) {
    if (!Util.hasClass(element, className)) {
        element.className += " " + className;
        element.className = element.className.trim();
    }
}

/**
 * 移除元素上指定的class
 * @param element
 * @param className
 */
Util.removeClass = function (element, className) {
    if (Util.hasClass(element, className)) {
        var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
        element.className = element.className.replace(reg, ' ').trim();
    }
}

/**
 * 获取指定的css的指定的设置值
 * @param {String} selectorText 该css的选择器文本
 * @param {String} styleName 要获取的属性名
 */
Util.getCSSStyleValue = function (selectorText, styleName) {
    for (var i = 0; i < document.styleSheets.length; i++) {
        var sheet = document.styleSheets[i];
        var cssRs = sheet.cssRules || sheet.rules;
        if (!cssRs) continue;
        for (var j = 0; j < cssRs.length; j++) {
            var c = cssRs[j];
            if (c.selectorText.toLowerCase() == selectorText.toLowerCase()) {
                return c.style[styleName];
            }
        }
    }
}

/**
 * 替换指定的节点
 * @param {Element} newChild
 * @param {Element} oldChild
 */
Util.replaceNode = function (newChild, oldChild) {
    oldChild.parentNode.appendChild(newChild);
    return oldChild.parentNode.replaceChild(newChild, oldChild);
}

/**
 * 获取2个元素在浏览器窗口中位置偏移的距离
 * @param {Element} fromElement
 * @param {Element} toElement
 * @return {Object}
 */
Util.getRelativePosition = function (fromElement, toElement) {
    var f = fromElement.getBoundingClientRect();
    var t = toElement.getBoundingClientRect();
    return { x: t.left - f.left, y: t.top - f.top };
}

/**
 * 实现一个自定义的动画过程
 * @param {Number} duration 动画的持续时间
 * @param {Number} millisec 动画的动作间隔
 * @param {Function} action  动画的动作
 * @param {Object} startArgs 动画的初始参数状态
 * @param {Object} endArgs  动画的终止参数状态
 * @param [{Function}] endcallbreak  当动画终止之后执行的回调
 */
Util.setInterval = function (duration, millisec, action, startArgs, endArgs, endcallbreak) {
    var endCallBreak = endcallbreak || function () { };
    var as = {};
    var k = duration / millisec;
    for (var p in startArgs) {
        var x = startArgs[p];
        var e = endArgs[p];
        if (typeof (x) == "number" && typeof (e) == "number") {
            as[p] = (e - x) / k;
        }
    }
    var c = 0;
    var ts = window.setInterval(function () {
        c++;
        if (c > k) {
            clearInterval(ts);
            endCallBreak();
        }
        else {
            for (var r in as) {
                startArgs[r] += as[r];
            }
            action(startArgs, as);
        }
    }, millisec);
}

//扩展字符串格式化
String.prototype.format = function (args) {
    var result = this;
    if (arguments.length > 0) {
        if (arguments.length == 1 && typeof (args) == "object") {
            for (var key in args) {
                if (args[key] != undefined) {
                    var reg = new RegExp("({" + key + "})", "g");
                    result = result.replace(reg, args[key]);
                }
            }
        }
        else {
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] != undefined) {
                    var reg = new RegExp("({[" + i + "]})", "g");
                    result = result.replace(reg, arguments[i]);
                }
            }
        }
    }
    return result;
}

//去除字符串空格
String.prototype.trim = function () {
    var result = this;
    var notValid = /(^\s)|(\s$)/;
    while (notValid.test(result)) {
        result = result.replace(notValid, "");
    }
    return result;
}

/**
 * @see 将javascript数据类型转换为json字符串
 * @param 待转换对象,支持  object,array,string,function,number,boolean,regexp
 * @return 返回json字符串
 */
Util.toJSON = function (object) {
    if (object == null) return 'null';
    var type = typeof object;
    if ('object' == type) {
        if (Array == object.constructor)
            type = 'array';
        else if (RegExp == object.constructor)
            type = 'regexp';
        else
            type = 'object';
    }
    switch (type) {
        case 'undefined':
        case 'unknown':
            return;
        case 'function':
        case 'boolean':
        case 'regexp':
            return object.toString();
        case 'number':
            return isFinite(object) ? object.toString() : 'null';
        case 'string':
            return '"' + object.replace(/(|")/g, "$1").replace(/n|r|t/g, function () {
                    var a = arguments[0];
                    return (a == 'n') ? 'n' : (a == 'r') ? 'r' : (a == 't') ? 't' : ""
                }) + '"';
        case 'object':
            if (object === null)
                return 'null';
            var results = [];
            for (var property in object) {
                var value = Util.toJSON(object[property]);
                if (value !== undefined) results.push(Util.toJSON(property) + ':' + value);
            }
            return '{' + results.join(',') + '}';
        case 'array':
            var results = [];
            for (var i = 0; i < object.length; i++) {
                var value = Util.toJSON(object[i]);
                if (value !== undefined) results.push(value);
            }
            return '[' + results.join(',') + ']';
    }
}

//停止事件冒泡
Util.stopBubble = function () {
    var e = window.event;
    //如果提供了事件对象，则这是一个非IE浏览器
    if (e && e.stopPropagation)
    //因此它支持W3C的stopPropagation()方法
        e.stopPropagation();
    else
    //否则，我们需要使用IE的方式来取消事件冒泡
        window.event.cancelBubble = true;
}

//点是否在面中
Util.IsPointInPolygon = function(pt, poly) {
    var i, j;
    var c = false;
    for (i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        if ((((poly[i].y <= pt.y) && (pt.y < poly[j].y)) ||
            ((poly[j].y <= pt.y) && (pt.y < poly[i].y)))
            && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)) {
            c = !c;
        }
    }
    return c;
}
var Prototype = {
    Version: '1.5.0_rc2',
    BrowserFeatures: {
        XPath: !!document.evaluate
    },

    ScriptFragment: '(?:<script.*?>)((\n|\r|.)*?)(?:<\/script>)',
    emptyFunction: function() {},
    K: function(x) { return x }
}

var Class = {
    create: function() {
        return function() {
            this.initialize.apply(this, arguments);
        }
    }

}


var Abstract = new Object();

Object.extend = function(destination, source) {
    for (var property in source) {
        destination[property] = source[property];
    }
    return destination;
}

Object.extend(Object, {
    inspect: function(object) {
        try {
            if (object === undefined) return 'undefined';
            if (object === null) return 'null';
            return object.inspect ? object.inspect() : object.toString();
        } catch (e) {
            if (e instanceof RangeError) return '...';
            throw e;
        }
    },

    keys: function(object) {
        var keys = [];
        for (var property in object)
            keys.push(property);
        return keys;
    },

    values: function(object) {
        var values = [];
        for (var property in object)
            values.push(object[property]);
        return values;
    },

    clone: function(object) {
        return Object.extend({}, object);
    }
});

Function.prototype.bind = function() {
    var __method = this, args = $A(arguments), object = args.shift();
    return function() {
        return __method.apply(object, args.concat($A(arguments)));
    }
}
//�����¼��ļ�����
Function.prototype.bindAsEventListener = function(object) {
    var __method = this, args = $A(arguments), object = args.shift();
    return function(event) {
        return __method.apply(object, [( event || window.event)].concat(args).concat($A(arguments)));
    }
}

Object.extend(Number.prototype, {
    toColorPart: function() {
        var digits = this.toString(16);
        if (this < 16) return '0' + digits;
        return digits;
    },

    succ: function() {
        return this + 1;
    },

    times: function(iterator) {
        $R(0, this, true).each(iterator);
        return this;
    }
});

var Try = {
    these: function() {
        var returnValue;

        for (var i = 0, length = arguments.length; i < length; i++) {
            var lambda = arguments[i];
            try {
                returnValue = lambda();
                break;
            } catch (e) {}
        }

        return returnValue;
    }
}

/*--------------------------------------------------------------------------*/

var PeriodicalExecuter = Class.create();
PeriodicalExecuter.prototype = {
    initialize: function(callback, frequency) {
        this.callback = callback;
        this.frequency = frequency;
        this.currentlyExecuting = false;

        this.registerCallback();
    },

    registerCallback: function() {
        this.timer = setInterval(this.onTimerEvent.bind(this), this.frequency * 1000);
    },

    stop: function() {
        if (!this.timer) return;
        clearInterval(this.timer);
        this.timer = null;
    },

    onTimerEvent: function() {
        if (!this.currentlyExecuting) {
            try {
                this.currentlyExecuting = true;
                this.callback(this);
            } finally {
                this.currentlyExecuting = false;
            }
        }
    }
}
Object.extend(String.prototype, {
    gsub: function(pattern, replacement) {
        var result = '', source = this, match;
        replacement = arguments.callee.prepareReplacement(replacement);

        while (source.length > 0) {
            if (match = source.match(pattern)) {
                result += source.slice(0, match.index);
                result += (replacement(match) || '').toString();
                source  = source.slice(match.index + match[0].length);
            } else {
                result += source, source = '';
            }
        }
        return result;
    },

    sub: function(pattern, replacement, count) {
        replacement = this.gsub.prepareReplacement(replacement);
        count = count === undefined ? 1 : count;

        return this.gsub(pattern, function(match) {
            if (--count < 0) return match[0];
            return replacement(match);
        });
    },

    scan: function(pattern, iterator) {
        this.gsub(pattern, iterator);
        return this;
    },

    truncate: function(length, truncation) {
        length = length || 30;
        truncation = truncation === undefined ? '...' : truncation;
        return this.length > length ?
        this.slice(0, length - truncation.length) + truncation : this;
    },

    strip: function() {
        return this.replace(/^\s+/, '').replace(/\s+$/, '');
    },

    stripTags: function() {
        return this.replace(/<\/?[^>]+>/gi, '');
    },

    stripScripts: function() {
        return this.replace(new RegExp(Prototype.ScriptFragment, 'img'), '');
    },

    extractScripts: function() {
        var matchAll = new RegExp(Prototype.ScriptFragment, 'img');
        var matchOne = new RegExp(Prototype.ScriptFragment, 'im');
        return (this.match(matchAll) || []).map(function(scriptTag) {
            return (scriptTag.match(matchOne) || ['', ''])[1];
        });
    },

    evalScripts: function() {
        return this.extractScripts().map(function(script) { return eval(script) });
    },

    escapeHTML: function() {
        var div = document.createElement('div');
        var text = document.createTextNode(this);
        div.appendChild(text);
        return div.innerHTML;
    },

    unescapeHTML: function() {
        var div = document.createElement('div');
        div.innerHTML = this.stripTags();
        return div.childNodes[0] ? (div.childNodes.length > 1 ?
            $A(div.childNodes).inject('',function(memo,node){ return memo+node.nodeValue }) :
            div.childNodes[0].nodeValue) : '';
    },

    toQueryParams: function(separator) {
        var match = this.strip().match(/([^?#]*)(#.*)?$/);
        if (!match) return {};

        return match[1].split(separator || '&').inject({}, function(hash, pair) {
            if ((pair = pair.split('='))[0]) {
                var name = decodeURIComponent(pair[0]);
                var value = pair[1] ? decodeURIComponent(pair[1]) : undefined;

                if (hash[name] !== undefined) {
                    if (hash[name].constructor != Array)
                        hash[name] = [hash[name]];
                    if (value) hash[name].push(value);
                }
                else hash[name] = value;
            }
            return hash;
        });
    },

    toArray: function() {
        return this.split('');
    },

    camelize: function() {
        var oStringList = this.split('-');
        if (oStringList.length == 1) return oStringList[0];

        var camelizedString = this.indexOf('-') == 0
            ? oStringList[0].charAt(0).toUpperCase() + oStringList[0].substring(1)
            : oStringList[0];

        for (var i = 1, length = oStringList.length; i < length; i++) {
            var s = oStringList[i];
            camelizedString += s.charAt(0).toUpperCase() + s.substring(1);
        }

        return camelizedString;
    },

    underscore: function() {
        return this.gsub(/::/, '/').gsub(/([A-Z]+)([A-Z][a-z])/,'#{1}_#{2}').gsub(/([a-z\d])([A-Z])/,'#{1}_#{2}').gsub(/-/,'-').toLowerCase();
    },

    dasherize: function() {
        return this.gsub(/_/,'-');
    },

    inspect: function(useDoubleQuotes) {
        var escapedString = this.replace(/\\/g, '\\\\');
        if (useDoubleQuotes)
            return '"' + escapedString.replace(/"/g, '\\"') + '"';
        else
            return "'" + escapedString.replace(/'/g, '\\\'') + "'";
    }
});

String.prototype.gsub.prepareReplacement = function(replacement) {
    if (typeof replacement == 'function') return replacement;
    var template = new Template(replacement);
    return function(match) { return template.evaluate(match) };
}

String.prototype.parseQuery = String.prototype.toQueryParams;

var Template = Class.create();
Template.Pattern = /(^|.|\r|\n)(#\{(.*?)\})/;
Template.prototype = {
    initialize: function(template, pattern) {
        this.template = template.toString();
        this.pattern  = pattern || Template.Pattern;
    },

    evaluate: function(object) {
        return this.template.gsub(this.pattern, function(match) {
            var before = match[1];
            if (before == '\\') return match[2];
            return before + (object[match[3]] || '').toString();
        });
    }
}

var $break    = new Object();
var $continue = new Object();

var Enumerable = {
    each: function(iterator) {
        var index = 0;
        try {
            this._each(function(value) {
                try {
                    iterator(value, index++);
                } catch (e) {
                    if (e != $continue) throw e;
                }
            });
        } catch (e) {
            if (e != $break) throw e;
        }
        return this;
    },

    eachSlice: function(number, iterator) {
        var index = -number, slices = [], array = this.toArray();
        while ((index += number) < array.length)
            slices.push(array.slice(index, index+number));
        return slices.collect(iterator || Prototype.K);
    },

    all: function(iterator) {
        var result = true;
        this.each(function(value, index) {
            result = result && !!(iterator || Prototype.K)(value, index);
            if (!result) throw $break;
        });
        return result;
    },

    any: function(iterator) {
        var result = false;
        this.each(function(value, index) {
            if (result = !!(iterator || Prototype.K)(value, index))
                throw $break;
        });
        return result;
    },

    collect: function(iterator) {
        var results = [];
        this.each(function(value, index) {
            results.push(iterator(value, index));
        });
        return results;
    },

    detect: function(iterator) {
        var result;
        this.each(function(value, index) {
            if (iterator(value, index)) {
                result = value;
                throw $break;
            }
        });
        return result;
    },

    findAll: function(iterator) {
        var results = [];
        this.each(function(value, index) {
            if (iterator(value, index))
                results.push(value);
        });
        return results;
    },

    grep: function(pattern, iterator) {
        var results = [];
        this.each(function(value, index) {
            var stringValue = value.toString();
            if (stringValue.match(pattern))
                results.push((iterator || Prototype.K)(value, index));
        })
        return results;
    },

    include: function(object) {
        var found = false;
        this.each(function(value) {
            if (value == object) {
                found = true;
                throw $break;
            }
        });
        return found;
    },

    inGroupsOf: function(number, fillWith) {
        fillWith = fillWith || null;
        var results = this.eachSlice(number);
        if (results.length > 0) (number - results.last().length).times(function() {
            results.last().push(fillWith)
        });
        return results;
    },

    inject: function(memo, iterator) {
        this.each(function(value, index) {
            memo = iterator(memo, value, index);
        });
        return memo;
    },

    invoke: function(method) {
        var args = $A(arguments).slice(1);
        return this.collect(function(value) {
            return value[method].apply(value, args);
        });
    },

    max: function(iterator) {
        var result;
        this.each(function(value, index) {
            value = (iterator || Prototype.K)(value, index);
            if (result == undefined || value >= result)
                result = value;
        });
        return result;
    },

    min: function(iterator) {
        var result;
        this.each(function(value, index) {
            value = (iterator || Prototype.K)(value, index);
            if (result == undefined || value < result)
                result = value;
        });
        return result;
    },

    partition: function(iterator) {
        var trues = [], falses = [];
        this.each(function(value, index) {
            ((iterator || Prototype.K)(value, index) ?
                trues : falses).push(value);
        });
        return [trues, falses];
    },

    pluck: function(property) {
        var results = [];
        this.each(function(value, index) {
            results.push(value[property]);
        });
        return results;
    },

    reject: function(iterator) {
        var results = [];
        this.each(function(value, index) {
            if (!iterator(value, index))
                results.push(value);
        });
        return results;
    },

    sortBy: function(iterator) {
        return this.collect(function(value, index) {
            return {value: value, criteria: iterator(value, index)};
        }).sort(function(left, right) {
            var a = left.criteria, b = right.criteria;
            return a < b ? -1 : a > b ? 1 : 0;
        }).pluck('value');
    },

    toArray: function() {
        return this.collect(Prototype.K);
    },

    zip: function() {
        var iterator = Prototype.K, args = $A(arguments);
        if (typeof args.last() == 'function')
            iterator = args.pop();

        var collections = [this].concat(args).map($A);
        return this.map(function(value, index) {
            return iterator(collections.pluck(index));
        });
    },

    inspect: function() {
        return '#<Enumerable:' + this.toArray().inspect() + '>';
    }
}

//避免与jquery冲突
var $notcjqueryprototype = function(obj){
    var cnf = function(f){
        var nf =f;
        return function(){
            try{
                return nf.apply(this,arguments);
            }
            catch(e){}
        }
    }
    for(var f in obj){
        obj[f]=cnf(obj[f]);
    }
}
$notcjqueryprototype(Enumerable);

Object.extend(Enumerable, {
    map:     Enumerable.collect,
    find:    Enumerable.detect,
    select:  Enumerable.findAll,
    member:  Enumerable.include,
    entries: Enumerable.toArray
});
var $A = Array.from = function(iterable) {
    if (!iterable) return [];
    if (iterable.toArray) {
        return iterable.toArray();
    } else {
        var results = [];
        for (var i = 0, length = iterable.length; i < length; i++)
            results.push(iterable[i]);
        return results;
    }
}

Object.extend(Array.prototype, Enumerable);

if (!Array.prototype._reverse)
    Array.prototype._reverse = function(){
        try{
            return Array.prototype.reverse.apply(this,arguments);
        }
        catch (e){}
    }

var $Enumerable2 = {
    _each: function(iterator) {
        for (var i = 0, length = this.length; i < length; i++)
            iterator(this[i]);
    },

    clear: function() {
        this.length = 0;
        return this;
    },

    first: function() {
        return this[0];
    },

    last: function() {
        return this[this.length - 1];
    },

    compact: function() {
        return this.select(function(value) {
            return value != undefined || value != null;
        });
    },

    flatten: function() {
        return this.inject([], function(array, value) {
            return array.concat(value && value.constructor == Array ?
                value.flatten() : [value]);
        });
    },

    without: function() {
        var values = $A(arguments);
        return this.select(function(value) {
            return !values.include(value);
        });
    },

    indexOf: function(object) {
        for (var i = 0, length = this.length; i < length; i++)
            if (this[i] == object) return i;
        return -1;
    },

    reverse: function(inline) {
        return (inline !== false ? this : this.toArray())._reverse();
    },

    reduce: function() {
        return this.length > 1 ? this : this[0];
    },

    uniq: function() {
        return this.inject([], function(array, value) {
            return array.include(value) ? array : array.concat([value]);
        });
    },

    clone: function() {
        return [].concat(this);
    },

    inspect: function() {
        return '[' + this.map(Object.inspect).join(', ') + ']';
    }
};
$notcjqueryprototype($Enumerable2);

Object.extend(Array.prototype, $Enumerable2 );

Array.prototype.toArray = Array.prototype.clone;

if(window.opera){
    Array.prototype.concat = function(){
        var array = [];
        for(var i = 0, length = this.length; i < length; i++) array.push(this[i]);
        for(var i = 0, length = arguments.length; i < length; i++) {
            if(arguments[i].constructor == Array) {
                for(var j = 0, arrayLength = arguments[i].length; j < arrayLength; j++)
                    array.push(arguments[i][j]);
            } else {
                array.push(arguments[i]);
            }
        }
        return array;
    }
}
var Hash = {
    _each: function(iterator) {
        for (var key in this) {
            var value = this[key];
            if (typeof value == 'function') continue;

            var pair = [key, value];
            pair.key = key;
            pair.value = value;
            iterator(pair);
        }
    },

    keys: function() {
        return this.pluck('key');
    },

    values: function() {
        return this.pluck('value');
    },

    merge: function(hash) {
        return $H(hash).inject(this, function(mergedHash, pair) {
            mergedHash[pair.key] = pair.value;
            return mergedHash;
        });
    },

    toQueryString: function() {
        return this.map(function(pair) {
            if (!pair.key) return null;

            if (pair.value && pair.value.constructor == Array) {
                pair.value = pair.value.compact();

                if (pair.value.length < 2) {
                    pair.value = pair.value.reduce();
                } else {
                    var key = encodeURIComponent(pair.key);
                    return pair.value.map(function(value) {
                        return key + '=' + encodeURIComponent(value);
                    }).join('&');
                }
            }

            if (pair.value == undefined) pair[1] = '';
            return pair.map(encodeURIComponent).join('=');
        }).join('&');
    },

    inspect: function() {
        return '#<Hash:{' + this.map(function(pair) {
                return pair.map(Object.inspect).join(': ');
            }).join(', ') + '}>';
    }
}

function $H(object) {
    var hash = Object.extend({}, object || {});
    Object.extend(hash, Enumerable);
    Object.extend(hash, Hash);
    return hash;
}
ObjectRange = Class.create();
Object.extend(ObjectRange.prototype, Enumerable);
Object.extend(ObjectRange.prototype, {
    initialize: function(start, end, exclusive) {
        this.start = start;
        this.end = end;
        this.exclusive = exclusive;
    },

    _each: function(iterator) {
        var value = this.start;
        while (this.include(value)) {
            iterator(value);
            value = value.succ();
        }
    },

    include: function(value) {
        if (value < this.start)
            return false;
        if (this.exclusive)
            return value < this.end;
        return value <= this.end;
    }
});

var $R = function(start, end, exclusive) {
    return new ObjectRange(start, end, exclusive);
}

var Ajax = {
    getTransport: function() {
        return Try.these(
                function() {return new XMLHttpRequest()},
                function() {return new ActiveXObject('Msxml2.XMLHTTP')},
                function() {return new ActiveXObject('Microsoft.XMLHTTP')}
            ) || false;
    },

    activeRequestCount: 0
}

Ajax.Responders = {
    responders: [],

    _each: function(iterator) {
        this.responders._each(iterator);
    },

    register: function(responder) {
        if (!this.include(responder))
            this.responders.push(responder);
    },

    unregister: function(responder) {
        this.responders = this.responders.without(responder);
    },

    dispatch: function(callback, request, transport, json) {
        this.each(function(responder) {
            if (typeof responder[callback] == 'function') {
                try {
                    responder[callback].apply(responder, [request, transport, json]);
                } catch (e) {}
            }
        });
    }
};

Object.extend(Ajax.Responders, Enumerable);

Ajax.Responders.register({
    onCreate: function() {
        Ajax.activeRequestCount++;
    },
    onComplete: function() {
        Ajax.activeRequestCount--;
    }
});

Ajax.Base = function() {};
Ajax.Base.prototype = {
    setOptions: function(options) {
        this.options = {
            method:       'post',
            asynchronous: true,
            contentType:  'application/x-www-form-urlencoded',
            encoding:     'UTF-8',
            parameters:   ''
        }
        Object.extend(this.options, options || {});

        this.options.method = this.options.method.toLowerCase();
        this.options.parameters = $H(typeof this.options.parameters == 'string' ?
            this.options.parameters.toQueryParams() : this.options.parameters);
    }
}

Ajax.Request = Class.create();
Ajax.Request.Events =
    ['Uninitialized', 'Loading', 'Loaded', 'Interactive', 'Complete'];

Ajax.Request.prototype = Object.extend(new Ajax.Base(), {
    _complete: false,

    initialize: function(url, options) {
        this.transport = Ajax.getTransport();
        this.setOptions(options);
        this.request(url);
    },

    request: function(url) {
        var params = this.options.parameters;
        if (params.any()) params['_'] = '';

        if (!['get', 'post'].include(this.options.method)) {
            // simulate other verbs over post
            params['_method'] = this.options.method;
            this.options.method = 'post';
        }

        this.url = url;

        // when GET, append parameters to URL
        if (this.options.method == 'get' && params.any())
            this.url += (this.url.indexOf('?') >= 0 ? '&' : '?') +
                params.toQueryString();

        try {
            Ajax.Responders.dispatch('onCreate', this, this.transport);

            this.transport.open(this.options.method.toUpperCase(), this.url,
                this.options.asynchronous, this.options.username,
                this.options.password);

            if (this.options.asynchronous)
                setTimeout(function() { this.respondToReadyState(1) }.bind(this), 10);

            this.transport.onreadystatechange = this.onStateChange.bind(this);
            this.setRequestHeaders();

            var body = this.options.method == 'post' ?
                (this.options.postBody || params.toQueryString()) : null;

            this.transport.send(body);

            /* Force Firefox to handle ready state 4 for synchronous requests */
            if (!this.options.asynchronous && this.transport.overrideMimeType)
                this.onStateChange();

        }
        catch (e) {
            this.dispatchException(e);
        }
    },

    onStateChange: function() {
        var readyState = this.transport.readyState;
        if (readyState > 1 && !((readyState == 4) && this._complete))
            this.respondToReadyState(this.transport.readyState);
    },

    setRequestHeaders: function() {
        var headers = {
            'X-Requested-With': 'XMLHttpRequest',
            'X-Prototype-Version': Prototype.Version,
            'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'
        };

        if (this.options.method == 'post') {
            headers['Content-type'] = this.options.contentType +
                (this.options.encoding ? '; charset=' + this.options.encoding : '');

            /* Force "Connection: close" for older Mozilla browsers to work
             * around a bug where XMLHttpRequest sends an incorrect
             * Content-length header. See Mozilla Bugzilla #246651.
             */
            if (this.transport.overrideMimeType &&
                (navigator.userAgent.match(/Gecko\/(\d{4})/) || [0,2005])[1] < 2005)
                headers['Connection'] = 'close';
        }

        // user-defined headers
        if (typeof this.options.requestHeaders == 'object') {
            var extras = this.options.requestHeaders;

            if (typeof extras.push == 'function')
                for (var i = 0, length = extras.length; i < length; i += 2)
                    headers[extras[i]] = extras[i+1];
            else
                $H(extras).each(function(pair) { headers[pair.key] = pair.value });
        }

        for (var name in headers)
            this.transport.setRequestHeader(name, headers[name]);
    },

    success: function() {
        return !this.transport.status
            || (this.transport.status >= 200 && this.transport.status < 300);
    },

    respondToReadyState: function(readyState) {
        var state = Ajax.Request.Events[readyState];
        var transport = this.transport, json = this.evalJSON();

        if (state == 'Complete') {
            try {
                this._complete = true;
                (this.options['on' + this.transport.status]
                || this.options['on' + (this.success() ? 'Success' : 'Failure')]
                || Prototype.emptyFunction)(transport, json);
            } catch (e) {
                this.dispatchException(e);
            }
        }

        try {
            (this.options['on' + state] || Prototype.emptyFunction)(transport, json);
            Ajax.Responders.dispatch('on' + state, this, transport, json);
        } catch (e) {
            this.dispatchException(e);
        }

        if (state == 'Complete') {
            if ((this.getHeader('Content-type') || '').strip().
                match(/^(text|application)\/(x-)?(java|ecma)script(;.*)?$/i))
                this.evalResponse();

            // avoid memory leak in MSIE: clean up
            this.transport.onreadystatechange = Prototype.emptyFunction;
        }
    },

    getHeader: function(name) {
        try {
            return this.transport.getResponseHeader(name);
        } catch (e) { return null }
    },

    evalJSON: function() {
        try {
            var json = this.getHeader('X-JSON');
            return json ? eval('(' + json + ')') : null;
        } catch (e) { return null }
    },

    evalResponse: function() {
        try {
            return eval(this.transport.responseText);
        } catch (e) {
            this.dispatchException(e);
        }
    },

    dispatchException: function(exception) {
        (this.options.onException || Prototype.emptyFunction)(this, exception);
        Ajax.Responders.dispatch('onException', this, exception);
    }
});

Ajax.Updater = Class.create();

Object.extend(Object.extend(Ajax.Updater.prototype, Ajax.Request.prototype), {
    initialize: function(container, url, options) {
        this.container = {
            success: (container.success || container),
            failure: (container.failure || (container.success ? null : container))
        }

        this.transport = Ajax.getTransport();
        this.setOptions(options);

        var onComplete = this.options.onComplete || Prototype.emptyFunction;
        this.options.onComplete = (function(transport, param) {
            this.updateContent();
            onComplete(transport, param);
        }).bind(this);

        this.request(url);
    },

    updateContent: function() {
        var receiver = this.container[this.success() ? 'success' : 'failure'];
        var response = this.transport.responseText;

        if (!this.options.evalScripts) response = response.stripScripts();

        if (receiver = Prototype.$(receiver)) {
            if (this.options.insertion)
                new this.options.insertion(receiver, response);
            else
                receiver.update(response);
        }

        if (this.success()) {
            if (this.onComplete)
                setTimeout(this.onComplete.bind(this), 10);
        }
    }
});

Ajax.PeriodicalUpdater = Class.create();
Ajax.PeriodicalUpdater.prototype = Object.extend(new Ajax.Base(), {
    initialize: function(container, url, options) {
        this.setOptions(options);
        this.onComplete = this.options.onComplete;

        this.frequency = (this.options.frequency || 2);
        this.decay = (this.options.decay || 1);

        this.updater = {};
        this.container = container;
        this.url = url;

        this.start();
    },

    start: function() {
        this.options.onComplete = this.updateComplete.bind(this);
        this.onTimerEvent();
    },

    stop: function() {
        this.updater.options.onComplete = undefined;
        clearTimeout(this.timer);
        (this.onComplete || Prototype.emptyFunction).apply(this, arguments);
    },

    updateComplete: function(request) {
        if (this.options.decay) {
            this.decay = (request.responseText == this.lastText ?
            this.decay * this.options.decay : 1);

            this.lastText = request.responseText;
        }
        this.timer = setTimeout(this.onTimerEvent.bind(this),
            this.decay * this.frequency * 1000);
    },

    onTimerEvent: function() {
        this.updater = new Ajax.Updater(this.container, this.url, this.options);
    }
});
Prototype.$=function(element) {
    if (arguments.length > 1) {
        for (var i = 0, elements = [], length = arguments.length; i < length; i++)
            elements.push(Prototype.$(arguments[i]));
        return elements;
    }
    if (typeof element == 'string')
        element = document.getElementById(element);
    return Element.extend(element);
}

if (Prototype.BrowserFeatures.XPath) {
    document._getElementsByXPath = function(expression, parentElement) {
        var results = [];
        var query = document.evaluate(expression, Prototype.$(parentElement) || document,
            null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        for (var i = 0, length = query.snapshotLength; i < length; i++)
            results.push(query.snapshotItem(i));
        return results;
    }
}

document.getElementsByClassName = function(className, parentElement) {
    if (Prototype.BrowserFeatures.XPath) {
        var q = ".//*[contains(concat(' ', @class, ' '), ' " + className + " ')]";
        return document._getElementsByXPath(q, parentElement);
    } else {
        var children = (Prototype.$(parentElement) || document.body).getElementsByTagName('*');
        var elements = [], child;
        for (var i = 0, length = children.length; i < length; i++) {
            child = children[i];
            if (Element.hasClassName(child, className))
                elements.push(Element.extend(child));
        }
        return elements;
    }
}

/*--------------------------------------------------------------------------*/

if (!window.Element)
    var Element = new Object();

Element.extend = function(element) {
    if (!element) return;
    if (_nativeExtensions || element.nodeType == 3) return element;

    if (!element._extended && element.tagName && element != window) {
        var methods = Object.clone(Element.Methods), cache = Element.extend.cache;

        if (element.tagName == 'FORM')
            Object.extend(methods, Form.Methods);
        if (['INPUT', 'TEXTAREA', 'SELECT'].include(element.tagName))
            Object.extend(methods, Form.Element.Methods);

        Object.extend(methods, Element.Methods.Simulated);

        for (var property in methods) {
            var value = methods[property];
            if (typeof value == 'function' && !(property in element))
                element[property] = cache.findOrStore(value);
        }
    }

    element._extended = true;
    return element;
}

Element.extend.cache = {
    findOrStore: function(value) {
        return this[value] = this[value] || function() {
                return value.apply(null, [this].concat($A(arguments)));
            }
    }
}

Element.Methods = {
    visible: function(element) {
        return Prototype.$(element).style.display != 'none';
    },

    toggle: function(element) {
        element = Prototype.$(element);
        Element[Element.visible(element) ? 'hide' : 'show'](element);
        return element;
    },

    hide: function(element) {
        Prototype.$(element).style.display = 'none';
        return element;
    },

    show: function(element) {
        Prototype.$(element).style.display = '';
        return element;
    },

    remove: function(element) {
        element = Prototype.$(element);
        element.parentNode.removeChild(element);
        return element;
    },

    update: function(element, html) {
        html = typeof html == 'undefined' ? '' : html.toString();
        Prototype.$(element).innerHTML = html.stripScripts();
        setTimeout(function() {html.evalScripts()}, 10);
        return element;
    },

    replace: function(element, html) {
        element = Prototype.$(element);
        if (element.outerHTML) {
            element.outerHTML = html.stripScripts();
        } else {
            var range = element.ownerDocument.createRange();
            range.selectNodeContents(element);
            element.parentNode.replaceChild(
                range.createContextualFragment(html.stripScripts()), element);
        }
        setTimeout(function() {html.evalScripts()}, 10);
        return element;
    },

    inspect: function(element) {
        element = Prototype.$(element);
        var result = '<' + element.tagName.toLowerCase();
        $H({'id': 'id', 'className': 'class'}).each(function(pair) {
            var property = pair.first(), attribute = pair.last();
            var value = (element[property] || '').toString();
            if (value) result += ' ' + attribute + '=' + value.inspect(true);
        });
        return result + '>';
    },

    recursivelyCollect: function(element, property) {
        element = Prototype.$(element);
        var elements = [];
        while (element = element[property])
            if (element.nodeType == 1)
                elements.push(Element.extend(element));
        return elements;
    },

    ancestors: function(element) {
        return Prototype.$(element).recursivelyCollect('parentNode');
    },

    descendants: function(element) {
        element = Prototype.$(element);
        return $A(element.getElementsByTagName('*'));
    },

    immediateDescendants: function(element) {
        if (!(element = Prototype.$(element).firstChild)) return [];
        while (element && element.nodeType != 1) element = element.nextSibling;
        if (element) return [element].concat(Prototype.$(element).nextSiblings());
        return [];
    },

    previousSiblings: function(element) {
        return Prototype.$(element).recursivelyCollect('previousSibling');
    },

    nextSiblings: function(element) {
        return Prototype.$(element).recursivelyCollect('nextSibling');
    },

    siblings: function(element) {
        element = Prototype.$(element);
        return element.previousSiblings().reverse().concat(element.nextSiblings());
    },

    match: function(element, selector) {
        element = Prototype.$(element);
        if (typeof selector == 'string')
            selector = new Selector(selector);
        return selector.match(element);
    },

    up: function(element, expression, index) {
        return Selector.findElement(Prototype.$(element).ancestors(), expression, index);
    },

    down: function(element, expression, index) {
        return Selector.findElement(Prototype.$(element).descendants(), expression, index);
    },

    previous: function(element, expression, index) {
        return Selector.findElement(Prototype.$(element).previousSiblings(), expression, index);
    },

    next: function(element, expression, index) {
        return Selector.findElement(Prototype.$(element).nextSiblings(), expression, index);
    },

    getElementsBySelector: function() {
        var args = $A(arguments), element = Prototype.$(args.shift());
        return Selector.findChildElements(element, args);
    },

    getElementsByClassName: function(element, className) {
        element = Prototype.$(element);
        return document.getElementsByClassName(className, element);
    },

    readAttribute: function(element, name) {
        return Prototype.$(element).getAttribute(name);
    },

    getHeight: function(element) {
        element = Prototype.$(element);
        return element.offsetHeight;
    },

    classNames: function(element) {
        return new Element.ClassNames(element);
    },

    hasClassName: function(element, className) {
        if (!(element = Prototype.$(element))) return;
        var elementClassName = element.className;
        if (elementClassName.length == 0) return false;
        if (elementClassName == className ||
            elementClassName.match(new RegExp("(^|\\s)" + className + "(\\s|$)")))
            return true;
        return false;
    },

    addClassName: function(element, className) {
        if (!(element = Prototype.$(element))) return;
        Element.classNames(element).add(className);
        return element;
    },

    removeClassName: function(element, className) {
        if (!(element = Prototype.$(element))) return;
        Element.classNames(element).remove(className);
        return element;
    },

    observe: function() {
        Event.observe.apply(Event, arguments);
        return $A(arguments).first();
    },

    stopObserving: function() {
        Event.stopObserving.apply(Event, arguments);
        return $A(arguments).first();
    },

    // removes whitespace-only text node children
    cleanWhitespace: function(element) {
        element = Prototype.$(element);
        var node = element.firstChild;
        while (node) {
            var nextNode = node.nextSibling;
            if (node.nodeType == 3 && !/\S/.test(node.nodeValue))
                element.removeChild(node);
            node = nextNode;
        }
        return element;
    },

    empty: function(element) {
        return Prototype.$(element).innerHTML.match(/^\s*$/);
    },

    childOf: function(element, ancestor) {
        element = Prototype.$(element), ancestor = Prototype.$(ancestor);
        while (element = element.parentNode)
            if (element == ancestor) return true;
        return false;
    },

    scrollTo: function(element) {
        element = Prototype.$(element);
        var x = element.x ? element.x : element.offsetLeft,
            y = element.y ? element.y : element.offsetTop;
        window.scrollTo(x, y);
        return element;
    },

    getStyle: function(element, style) {
        element = Prototype.$(element);
        var inline = (style == 'float' ?
            (typeof element.style.styleFloat != 'undefined' ? 'styleFloat' : 'cssFloat') : style);
        var value = element.style[inline.camelize()];
        if (!value) {
            if (document.defaultView && document.defaultView.getComputedStyle) {
                var css = document.defaultView.getComputedStyle(element, null);
                value = css ? css.getPropertyValue(style) : null;
            } else if (element.currentStyle) {
                value = element.currentStyle[inline.camelize()];
            }
        }

        if((value == 'auto') && ['width','height'].include(style) && (element.getStyle('display') != 'none'))
            value = element['offset'+style.charAt(0).toUpperCase()+style.substring(1)] + 'px';

        if (window.opera && ['left', 'top', 'right', 'bottom'].include(style))
            if (Element.getStyle(element, 'position') == 'static') value = 'auto';

        return value == 'auto' ? null : value;
    },

    setStyle: function(element, style) {
        element = Prototype.$(element);
        for (var name in style)
            element.style[ (name == 'float' ?
                ((typeof element.style.styleFloat != 'undefined') ? 'styleFloat' : 'cssFloat') : name).camelize()
                ] = style[name];
        return element;
    },

    getDimensions: function(element) {
        element = Prototype.$(element);
        if (Element.getStyle(element, 'display') != 'none')
            return {width: element.offsetWidth, height: element.offsetHeight};

        // All *Width and *Height properties give 0 on elements with display none,
        // so enable the element temporarily
        var els = element.style;
        var originalVisibility = els.visibility;
        var originalPosition = els.position;
        els.visibility = 'hidden';
        els.position = 'absolute';
        els.display = '';
        var originalWidth = element.clientWidth;
        var originalHeight = element.clientHeight;
        els.display = 'none';
        els.position = originalPosition;
        els.visibility = originalVisibility;
        return {width: originalWidth, height: originalHeight};
    },

    makePositioned: function(element) {
        element = Prototype.$(element);
        var pos = Element.getStyle(element, 'position');
        if (pos == 'static' || !pos) {
            element._madePositioned = true;
            element.style.position = 'relative';
            // Opera returns the offset relative to the positioning context, when an
            // element is position relative but top and left have not been defined
            if (window.opera) {
                element.style.top = 0;
                element.style.left = 0;
            }
        }
        return element;
    },

    undoPositioned: function(element) {
        element = Prototype.$(element);
        if (element._madePositioned) {
            element._madePositioned = undefined;
            element.style.position =
                element.style.top =
                    element.style.left =
                        element.style.bottom =
                            element.style.right = '';
        }
        return element;
    },

    makeClipping: function(element) {
        element = Prototype.$(element);
        if (element._overflow) return element;
        element._overflow = element.style.overflow || 'auto';
        if ((Element.getStyle(element, 'overflow') || 'visible') != 'hidden')
            element.style.overflow = 'hidden';
        return element;
    },

    undoClipping: function(element) {
        element = Prototype.$(element);
        if (!element._overflow) return element;
        element.style.overflow = element._overflow == 'auto' ? '' : element._overflow;
        element._overflow = null;
        return element;
    }
}

Element.Methods.Simulated = {
    hasAttribute: function(element, attribute) {
        return Prototype.$(element).getAttributeNode(attribute).specified;
    }
}

// IE is missing .innerHTML support for TABLE-related elements
if(document.all){
    Element.Methods.update = function(element, html) {
        element = Prototype.$(element);
        html = typeof html == 'undefined' ? '' : html.toString();
        var tagName = element.tagName.toUpperCase();
        if (['THEAD','TBODY','TR','TD'].include(tagName)) {
            var div = document.createElement('div');
            switch (tagName) {
                case 'THEAD':
                case 'TBODY':
                    div.innerHTML = '<table><tbody>' +  html.stripScripts() + '</tbody></table>';
                    depth = 2;
                    break;
                case 'TR':
                    div.innerHTML = '<table><tbody><tr>' +  html.stripScripts() + '</tr></tbody></table>';
                    depth = 3;
                    break;
                case 'TD':
                    div.innerHTML = '<table><tbody><tr><td>' +  html.stripScripts() + '</td></tr></tbody></table>';
                    depth = 4;
            }
            $A(element.childNodes).each(function(node){
                element.removeChild(node)
            });
            depth.times(function(){ div = div.firstChild });

            $A(div.childNodes).each(
                function(node){ element.appendChild(node) });
        } else {
            element.innerHTML = html.stripScripts();
        }
        setTimeout(function() {html.evalScripts()}, 10);
        return element;
    }
}

Object.extend(Element, Element.Methods);

var _nativeExtensions = false;

if(/Konqueror|Safari|KHTML/.test(navigator.userAgent))
    ['', 'Form', 'Input', 'TextArea', 'Select'].each(function(tag) {
        var className = 'HTML' + tag + 'Element';
        if(window[className]) return;
        var klass = window[className] = {};
        klass.prototype = document.createElement(tag ? tag.toLowerCase() : 'div').__proto__;
    });

Element.addMethods = function(methods) {
    Object.extend(Element.Methods, methods || {});

    function copy(methods, destination, onlyIfAbsent) {
        onlyIfAbsent = onlyIfAbsent || false;
        var cache = Element.extend.cache;
        for (var property in methods) {
            var value = methods[property];
            if (!onlyIfAbsent || !(property in destination))
                destination[property] = cache.findOrStore(value);
        }
    }

    if (typeof HTMLElement != 'undefined') {
        copy(Element.Methods, HTMLElement.prototype);
        copy(Element.Methods.Simulated, HTMLElement.prototype, true);
        copy(Form.Methods, HTMLFormElement.prototype);
        [HTMLInputElement, HTMLTextAreaElement, HTMLSelectElement].each(function(klass) {
            copy(Form.Element.Methods, klass.prototype);
        });
        _nativeExtensions = true;
    }
}

var Toggle = new Object();
Toggle.display = Element.toggle;

/*--------------------------------------------------------------------------*/

Abstract.Insertion = function(adjacency) {
    this.adjacency = adjacency;
}

Abstract.Insertion.prototype = {
    initialize: function(element, content) {
        this.element = Prototype.$(element);
        this.content = content.stripScripts();

        if (this.adjacency && this.element.insertAdjacentHTML) {
            try {
                this.element.insertAdjacentHTML(this.adjacency, this.content);
            } catch (e) {
                var tagName = this.element.tagName.toUpperCase();
                if (['TBODY', 'TR'].include(tagName)) {
                    this.insertContent(this.contentFromAnonymousTable());
                } else {
                    throw e;
                }
            }
        } else {
            this.range = this.element.ownerDocument.createRange();
            if (this.initializeRange) this.initializeRange();
            this.insertContent([this.range.createContextualFragment(this.content)]);
        }

        setTimeout(function() {content.evalScripts()}, 10);
    },

    contentFromAnonymousTable: function() {
        var div = document.createElement('div');
        div.innerHTML = '<table><tbody>' + this.content + '</tbody></table>';
        return $A(div.childNodes[0].childNodes[0].childNodes);
    }
}

var Insertion = new Object();

Insertion.Before = Class.create();
Insertion.Before.prototype = Object.extend(new Abstract.Insertion('beforeBegin'), {
    initializeRange: function() {
        this.range.setStartBefore(this.element);
    },

    insertContent: function(fragments) {
        fragments.each((function(fragment) {
            this.element.parentNode.insertBefore(fragment, this.element);
        }).bind(this));
    }
});

Insertion.Top = Class.create();
Insertion.Top.prototype = Object.extend(new Abstract.Insertion('afterBegin'), {
    initializeRange: function() {
        this.range.selectNodeContents(this.element);
        this.range.collapse(true);
    },

    insertContent: function(fragments) {
        fragments.reverse(false).each((function(fragment) {
            this.element.insertBefore(fragment, this.element.firstChild);
        }).bind(this));
    }
});

Insertion.Bottom = Class.create();
Insertion.Bottom.prototype = Object.extend(new Abstract.Insertion('beforeEnd'), {
    initializeRange: function() {
        this.range.selectNodeContents(this.element);
        this.range.collapse(this.element);
    },

    insertContent: function(fragments) {
        fragments.each((function(fragment) {
            this.element.appendChild(fragment);
        }).bind(this));
    }
});

Insertion.After = Class.create();
Insertion.After.prototype = Object.extend(new Abstract.Insertion('afterEnd'), {
    initializeRange: function() {
        this.range.setStartAfter(this.element);
    },

    insertContent: function(fragments) {
        fragments.each((function(fragment) {
            this.element.parentNode.insertBefore(fragment,
                this.element.nextSibling);
        }).bind(this));
    }
});

/*--------------------------------------------------------------------------*/

Element.ClassNames = Class.create();
Element.ClassNames.prototype = {
    initialize: function(element) {
        this.element = Prototype.$(element);
    },

    _each: function(iterator) {
        this.element.className.split(/\s+/).select(function(name) {
            return name.length > 0;
        })._each(iterator);
    },

    set: function(className) {
        this.element.className = className;
    },

    add: function(classNameToAdd) {
        if (this.include(classNameToAdd)) return;
        this.set($A(this).concat(classNameToAdd).join(' '));
    },

    remove: function(classNameToRemove) {
        if (!this.include(classNameToRemove)) return;
        this.set($A(this).without(classNameToRemove).join(' '));
    },

    toString: function() {
        return $A(this).join(' ');
    }
}

Object.extend(Element.ClassNames.prototype, Enumerable);
var Selector = Class.create();
Selector.prototype = {
    initialize: function(expression) {
        this.params = {classNames: []};
        this.expression = expression.toString().strip();
        this.parseExpression();
        this.compileMatcher();
    },

    parseExpression: function() {
        function abort(message) { throw 'Parse error in selector: ' + message; }

        if (this.expression == '')  abort('empty expression');

        var params = this.params, expr = this.expression, match, modifier, clause, rest;
        while (match = expr.match(/^(.*)\[([a-z0-9_:-]+?)(?:([~\|!]?=)(?:"([^"]*)"|([^\]\s]*)))?\]$/i)) {
            params.attributes = params.attributes || [];
            params.attributes.push({name: match[2], operator: match[3], value: match[4] || match[5] || ''});
            expr = match[1];
        }

        if (expr == '*') return this.params.wildcard = true;

        while (match = expr.match(/^([^a-z0-9_-])?([a-z0-9_-]+)(.*)/i)) {
            modifier = match[1], clause = match[2], rest = match[3];
            switch (modifier) {
                case '#':       params.id = clause; break;
                case '.':       params.classNames.push(clause); break;
                case '':
                case undefined: params.tagName = clause.toUpperCase(); break;
                default:        abort(expr.inspect());
            }
            expr = rest;
        }

        if (expr.length > 0) abort(expr.inspect());
    },

    buildMatchExpression: function() {
        var params = this.params, conditions = [], clause;

        if (params.wildcard)
            conditions.push('true');
        if (clause = params.id)
            conditions.push('element.id == ' + clause.inspect());
        if (clause = params.tagName)
            conditions.push('element.tagName.toUpperCase() == ' + clause.inspect());
        if ((clause = params.classNames).length > 0)
            for (var i = 0, length = clause.length; i < length; i++)
                conditions.push('Element.hasClassName(element, ' + clause[i].inspect() + ')');
        if (clause = params.attributes) {
            clause.each(function(attribute) {
                var value = 'element.getAttribute(' + attribute.name.inspect() + ')';
                var splitValueBy = function(delimiter) {
                    return value + ' && ' + value + '.split(' + delimiter.inspect() + ')';
                }

                switch (attribute.operator) {
                    case '=':       conditions.push(value + ' == ' + attribute.value.inspect()); break;
                    case '~=':      conditions.push(splitValueBy(' ') + '.include(' + attribute.value.inspect() + ')'); break;
                    case '|=':      conditions.push(
                        splitValueBy('-') + '.first().toUpperCase() == ' + attribute.value.toUpperCase().inspect()
                    ); break;
                    case '!=':      conditions.push(value + ' != ' + attribute.value.inspect()); break;
                    case '':
                    case undefined: conditions.push(value + ' != null'); break;
                    default:        throw 'Unknown operator ' + attribute.operator + ' in selector';
                }
            });
        }

        return conditions.join(' && ');
    },

    compileMatcher: function() {
        this.match = new Function('element', 'if (!element.tagName) return false; \
      return ' + this.buildMatchExpression());
    },

    findElements: function(scope) {
        var element;

        if (element = Prototype.$(this.params.id))
            if (this.match(element))
                if (!scope || Element.childOf(element, scope))
                    return [element];

        scope = (scope || document).getElementsByTagName(this.params.tagName || '*');

        var results = [];
        for (var i = 0, length = scope.length; i < length; i++)
            if (this.match(element = scope[i]))
                results.push(Element.extend(element));

        return results;
    },

    toString: function() {
        return this.expression;
    }
}

Object.extend(Selector, {
    matchElements: function(elements, expression) {
        var selector = new Selector(expression);
        return elements.select(selector.match.bind(selector)).collect(Element.extend);
    },

    findElement: function(elements, expression, index) {
        if (typeof expression == 'number') index = expression, expression = false;
        return Selector.matchElements(elements, expression || '*')[index || 0];
    },

    findChildElements: function(element, expressions) {
        return expressions.map(function(expression) {
            return expression.strip().split(/\s+/).inject([null], function(results, expr) {
                var selector = new Selector(expr);
                return results.inject([], function(elements, result) {
                    return elements.concat(selector.findElements(result || element));
                });
            });
        }).flatten();
    }
});

function $$() {
    return Selector.findChildElements(document, $A(arguments));
}
var Form = {
    reset: function(form) {
        Prototype.$(form).reset();
        return form;
    },

    serializeElements: function(elements) {
        return elements.inject([], function(queryComponents, element) {
            var queryComponent = Form.Element.serialize(element);
            if (queryComponent) queryComponents.push(queryComponent);
            return queryComponents;
        }).join('&');
    }
};

Form.Methods = {
    serialize: function(form) {
        return Form.serializeElements(Prototype.$(form).getElements());
    },

    getElements: function(form) {
        return $A(Prototype.$(form).getElementsByTagName('*')).inject([],
            function(elements, child) {
                if (Form.Element.Serializers[child.tagName.toLowerCase()])
                    elements.push(Element.extend(child));
                return elements;
            }
        );
    },

    getInputs: function(form, typeName, name) {
        form = Prototype.$(form);
        var inputs = form.getElementsByTagName('input');

        if (!typeName && !name)
            return inputs;

        var matchingInputs = new Array();
        for (var i = 0, length = inputs.length; i < length; i++) {
            var input = inputs[i];
            if ((typeName && input.type != typeName) ||
                (name && input.name != name))
                continue;
            matchingInputs.push(Element.extend(input));
        }

        return matchingInputs;
    },

    disable: function(form) {
        form = Prototype.$(form);
        form.getElements().each(function(element) {
            element.blur();
            element.disabled = 'true';
        });
        return form;
    },

    enable: function(form) {
        form = Prototype.$(form);
        form.getElements().each(function(element) {
            element.disabled = '';
        });
        return form;
    },

    findFirstElement: function(form) {
        return Prototype.$(form).getElements().find(function(element) {
            return element.type != 'hidden' && !element.disabled &&
                ['input', 'select', 'textarea'].include(element.tagName.toLowerCase());
        });
    },

    focusFirstElement: function(form) {
        form = Prototype.$(form);
        form.findFirstElement().activate();
        return form;
    }
}

Object.extend(Form, Form.Methods);

/*--------------------------------------------------------------------------*/

Form.Element = {
    focus: function(element) {
        Prototype.$(element).focus();
        return element;
    },

    select: function(element) {
        Prototype.$(element).select();
        return element;
    }
}

Form.Element.Methods = {
    serialize: function(element) {
        element = Prototype.$(element);
        if (element.disabled) return '';
        var method = element.tagName.toLowerCase();
        var parameter = Form.Element.Serializers[method](element);

        if (parameter) {
            var key = encodeURIComponent(parameter[0]);
            if (key.length == 0) return;

            if (parameter[1].constructor != Array)
                parameter[1] = [parameter[1]];

            return parameter[1].map(function(value) {
                return key + '=' + encodeURIComponent(value);
            }).join('&');
        }
    },

    getValue: function(element) {
        element = Prototype.$(element);
        var method = element.tagName.toLowerCase();
        var parameter = Form.Element.Serializers[method](element);

        if (parameter)
            return parameter[1];
    },

    clear: function(element) {
        Prototype.$(element).value = '';
        return element;
    },

    present: function(element) {
        return Prototype.$(element).value != '';
    },

    activate: function(element) {
        element = Prototype.$(element);
        element.focus();
        if (element.select && ( element.tagName.toLowerCase() != 'input' ||
            !['button', 'reset', 'submit'].include(element.type) ) )
            element.select();
        return element;
    },

    disable: function(element) {
        element = Prototype.$(element);
        element.disabled = true;
        return element;
    },

    enable: function(element) {
        element = Prototype.$(element);
        element.blur();
        element.disabled = false;
        return element;
    }
}

Object.extend(Form.Element, Form.Element.Methods);
var Field = Form.Element;

/*--------------------------------------------------------------------------*/

Form.Element.Serializers = {
    input: function(element) {
        switch (element.type.toLowerCase()) {
            case 'checkbox':
            case 'radio':
                return Form.Element.Serializers.inputSelector(element);
            default:
                return Form.Element.Serializers.textarea(element);
        }
        return false;
    },

    inputSelector: function(element) {
        if (element.checked)
            return [element.name, element.value];
    },

    textarea: function(element) {
        return [element.name, element.value];
    },

    select: function(element) {
        return Form.Element.Serializers[element.type == 'select-one' ?
            'selectOne' : 'selectMany'](element);
    },

    selectOne: function(element) {
        var value = '', opt, index = element.selectedIndex;
        if (index >= 0) {
            opt = Element.extend(element.options[index]);
            // Uses the new potential extension if hasAttribute isn't native.
            value = opt.hasAttribute('value') ? opt.value : opt.text;
        }
        return [element.name, value];
    },

    selectMany: function(element) {
        var value = [];
        for (var i = 0, length = element.length; i < length; i++) {
            var opt = Element.extend(element.options[i]);
            if (opt.selected)
            // Uses the new potential extension if hasAttribute isn't native.
                value.push(opt.hasAttribute('value') ? opt.value : opt.text);
        }
        return [element.name, value];
    }
}

/*--------------------------------------------------------------------------*/

var $F = Form.Element.getValue;

/*--------------------------------------------------------------------------*/

Abstract.TimedObserver = function() {}
Abstract.TimedObserver.prototype = {
    initialize: function(element, frequency, callback) {
        this.frequency = frequency;
        this.element   = Prototype.$(element);
        this.callback  = callback;

        this.lastValue = this.getValue();
        this.registerCallback();
    },

    registerCallback: function() {
        setInterval(this.onTimerEvent.bind(this), this.frequency * 1000);
    },

    onTimerEvent: function() {
        var value = this.getValue();
        if (this.lastValue != value) {
            this.callback(this.element, value);
            this.lastValue = value;
        }
    }
}

Form.Element.Observer = Class.create();
Form.Element.Observer.prototype = Object.extend(new Abstract.TimedObserver(), {
    getValue: function() {
        return Form.Element.getValue(this.element);
    }
});

Form.Observer = Class.create();
Form.Observer.prototype = Object.extend(new Abstract.TimedObserver(), {
    getValue: function() {
        return Form.serialize(this.element);
    }
});

/*--------------------------------------------------------------------------*/

Abstract.EventObserver = function() {}
Abstract.EventObserver.prototype = {
    initialize: function(element, callback) {
        this.element  = Prototype.$(element);
        this.callback = callback;

        this.lastValue = this.getValue();
        if (this.element.tagName.toLowerCase() == 'form')
            this.registerFormCallbacks();
        else
            this.registerCallback(this.element);
    },

    onElementEvent: function() {
        var value = this.getValue();
        if (this.lastValue != value) {
            this.callback(this.element, value);
            this.lastValue = value;
        }
    },

    registerFormCallbacks: function() {
        Form.getElements(this.element).each(this.registerCallback.bind(this));
    },

    registerCallback: function(element) {
        if (element.type) {
            switch (element.type.toLowerCase()) {
                case 'checkbox':
                case 'radio':
                    Event.observe(element, 'click', this.onElementEvent.bind(this));
                    break;
                default:
                    Event.observe(element, 'change', this.onElementEvent.bind(this));
                    break;
            }
        }
    }
}

Form.Element.EventObserver = Class.create();
Form.Element.EventObserver.prototype = Object.extend(new Abstract.EventObserver(), {
    getValue: function() {
        return Form.Element.getValue(this.element);
    }
});

Form.EventObserver = Class.create();
Form.EventObserver.prototype = Object.extend(new Abstract.EventObserver(), {
    getValue: function() {
        return Form.serialize(this.element);
    }
});
if (!window.Event) {
    var Event = new Object();
}

Object.extend(Event, {
    KEY_BACKSPACE: 8,
    KEY_TAB:       9,
    KEY_RETURN:   13,
    KEY_ESC:      27,
    KEY_LEFT:     37,
    KEY_UP:       38,
    KEY_RIGHT:    39,
    KEY_DOWN:     40,
    KEY_DELETE:   46,
    KEY_HOME:     36,
    KEY_END:      35,
    KEY_PAGEUP:   33,
    KEY_PAGEDOWN: 34,

    element: function(event) {
        return event.target || event.srcElement;
    },

    isLeftClick: function(event) {
        return (((event.which) && (event.which == 1)) ||
        ((event.button) && (event.button == 1)));
    },

    pointerX: function(event) {
        return event.pageX || (event.clientX +
            (document.documentElement.scrollLeft || document.body.scrollLeft));
    },

    pointerY: function(event) {
        return event.pageY || (event.clientY +
            (document.documentElement.scrollTop || document.body.scrollTop));
    },

    stop: function(event) {
        if (event.preventDefault) {
            event.preventDefault();
            event.stopPropagation();
        } else {
            event.returnValue = false;
            event.cancelBubble = true;
        }
    },

    // find the first node with the given tagName, starting from the
    // node the event was triggered on; traverses the DOM upwards
    findElement: function(event, tagName) {
        var element = Event.element(event);
        while (element.parentNode && (!element.tagName ||
        (element.tagName.toUpperCase() != tagName.toUpperCase())))
            element = element.parentNode;
        return element;
    },

    observers: false,

    _observeAndCache: function(element, name, observer, useCapture) {
        if (!this.observers) this.observers = [];
        if (element.addEventListener) {
            this.observers.push([element, name, observer, useCapture]);
            element.addEventListener(name, observer, useCapture);
        } else if (element.attachEvent) {
            this.observers.push([element, name, observer, useCapture]);
            element.attachEvent('on' + name, observer);
        }
    },

    unloadCache: function() {
        if (!Event.observers) return;
        for (var i = 0, length = Event.observers.length; i < length; i++) {
            Event.stopObserving.apply(this, Event.observers[i]);
            Event.observers[i][0] = null;
        }
        Event.observers = false;
    },

    observe: function(element, name, observer, useCapture) {
        element = Prototype.$(element);
        useCapture = useCapture || false;

        if (name == 'keypress' &&
            (navigator.appVersion.match(/Konqueror|Safari|KHTML/)
            || element.attachEvent))
            name = 'keydown';

        Event._observeAndCache(element, name, observer, useCapture);
    },

    stopObserving: function(element, name, observer, useCapture) {
        element = Prototype.$(element);
        useCapture = useCapture || false;

        if (name == 'keypress' &&
            (navigator.appVersion.match(/Konqueror|Safari|KHTML/)
            || element.detachEvent))
            name = 'keydown';

        if (element.removeEventListener) {
            element.removeEventListener(name, observer, useCapture);
        } else if (element.detachEvent) {
            try {
                element.detachEvent('on' + name, observer);
            } catch (e) {}
        }
    }
});

/* prevent memory leaks in IE */
if (navigator.appVersion.match(/\bMSIE\b/))
    Event.observe(window, 'unload', Event.unloadCache, false);
var Position = {
    // set to true if needed, warning: firefox performance problems
    // NOT neeeded for page scrolling, only if draggable contained in
    // scrollable elements
    includeScrollOffsets: false,

    // must be called before calling withinIncludingScrolloffset, every time the
    // page is scrolled
    prepare: function() {
        this.deltaX =  window.pageXOffset
            || document.documentElement.scrollLeft
            || document.body.scrollLeft
            || 0;
        this.deltaY =  window.pageYOffset
            || document.documentElement.scrollTop
            || document.body.scrollTop
            || 0;
    },

    realOffset: function(element) {
        var valueT = 0, valueL = 0;
        do {
            valueT += element.scrollTop  || 0;
            valueL += element.scrollLeft || 0;
            element = element.parentNode;
        } while (element);
        return [valueL, valueT];
    },

    cumulativeOffset: function(element) {
        var valueT = 0, valueL = 0;
        do {
            valueT += element.offsetTop  || 0;
            valueL += element.offsetLeft || 0;
            element = element.offsetParent;
        } while (element);
        return [valueL, valueT];
    },

    positionedOffset: function(element) {
        var valueT = 0, valueL = 0;
        do {
            valueT += element.offsetTop  || 0;
            valueL += element.offsetLeft || 0;
            element = element.offsetParent;
            if (element) {
                if(element.tagName=='BODY') break;
                var p = Element.getStyle(element, 'position');
                if (p == 'relative' || p == 'absolute') break;
            }
        } while (element);
        return [valueL, valueT];
    },

    offsetParent: function(element) {
        if (element.offsetParent) return element.offsetParent;
        if (element == document.body) return element;

        while ((element = element.parentNode) && element != document.body)
            if (Element.getStyle(element, 'position') != 'static')
                return element;

        return document.body;
    },

    // caches x/y coordinate pair to use with overlap
    within: function(element, x, y) {
        if (this.includeScrollOffsets)
            return this.withinIncludingScrolloffsets(element, x, y);
        this.xcomp = x;
        this.ycomp = y;
        this.offset = this.cumulativeOffset(element);

        return (y >= this.offset[1] &&
        y <  this.offset[1] + element.offsetHeight &&
        x >= this.offset[0] &&
        x <  this.offset[0] + element.offsetWidth);
    },

    withinIncludingScrolloffsets: function(element, x, y) {
        var offsetcache = this.realOffset(element);

        this.xcomp = x + offsetcache[0] - this.deltaX;
        this.ycomp = y + offsetcache[1] - this.deltaY;
        this.offset = this.cumulativeOffset(element);

        return (this.ycomp >= this.offset[1] &&
        this.ycomp <  this.offset[1] + element.offsetHeight &&
        this.xcomp >= this.offset[0] &&
        this.xcomp <  this.offset[0] + element.offsetWidth);
    },

    // within must be called directly before
    overlap: function(mode, element) {
        if (!mode) return 0;
        if (mode == 'vertical')
            return ((this.offset[1] + element.offsetHeight) - this.ycomp) /
                element.offsetHeight;
        if (mode == 'horizontal')
            return ((this.offset[0] + element.offsetWidth) - this.xcomp) /
                element.offsetWidth;
    },

    page: function(forElement) {
        var valueT = 0, valueL = 0;

        var element = forElement;
        do {
            valueT += element.offsetTop  || 0;
            valueL += element.offsetLeft || 0;

            // Safari fix
            if (element.offsetParent==document.body)
                if (Element.getStyle(element,'position')=='absolute') break;

        } while (element = element.offsetParent);

        element = forElement;
        do {
            if (!window.opera || element.tagName=='BODY') {
                valueT -= element.scrollTop  || 0;
                valueL -= element.scrollLeft || 0;
            }
        } while (element = element.parentNode);

        return [valueL, valueT];
    },

    clone: function(source, target) {
        var options = Object.extend({
            setLeft:    true,
            setTop:     true,
            setWidth:   true,
            setHeight:  true,
            offsetTop:  0,
            offsetLeft: 0
        }, arguments[2] || {})

        // find page position of source
        source = Prototype.$(source);
        var p = Position.page(source);

        // find coordinate system to use
        target = Prototype.$(target);
        var delta = [0, 0];
        var parent = null;
        // delta [0,0] will do fine with position: fixed elements,
        // position:absolute needs offsetParent deltas
        if (Element.getStyle(target,'position') == 'absolute') {
            parent = Position.offsetParent(target);
            delta = Position.page(parent);
        }

        // correct by body offsets (fixes Safari)
        if (parent == document.body) {
            delta[0] -= document.body.offsetLeft;
            delta[1] -= document.body.offsetTop;
        }

        // set position
        if(options.setLeft)   target.style.left  = (p[0] - delta[0] + options.offsetLeft) + 'px';
        if(options.setTop)    target.style.top   = (p[1] - delta[1] + options.offsetTop) + 'px';
        if(options.setWidth)  target.style.width = source.offsetWidth + 'px';
        if(options.setHeight) target.style.height = source.offsetHeight + 'px';
    },

    absolutize: function(element) {
        element = Prototype.$(element);
        if (element.style.position == 'absolute') return;
        Position.prepare();

        var offsets = Position.positionedOffset(element);
        var top     = offsets[1];
        var left    = offsets[0];
        var width   = element.clientWidth;
        var height  = element.clientHeight;

        element._originalLeft   = left - parseFloat(element.style.left  || 0);
        element._originalTop    = top  - parseFloat(element.style.top || 0);
        element._originalWidth  = element.style.width;
        element._originalHeight = element.style.height;

        element.style.position = 'absolute';
        element.style.top    = top + 'px';;
        element.style.left   = left + 'px';;
        element.style.width  = width + 'px';;
        element.style.height = height + 'px';;
    },

    relativize: function(element) {
        element = Prototype.$(element);
        if (element.style.position == 'relative') return;
        Position.prepare();

        element.style.position = 'relative';
        var top  = parseFloat(element.style.top  || 0) - (element._originalTop || 0);
        var left = parseFloat(element.style.left || 0) - (element._originalLeft || 0);

        element.style.top    = top + 'px';
        element.style.left   = left + 'px';
        element.style.height = element._originalHeight;
        element.style.width  = element._originalWidth;
    }
}

// Safari returns margins on body which is incorrect if the child is absolutely
// positioned.  For performance reasons, redefine Position.cumulativeOffset for
// KHTML/WebKit only.
if (/Konqueror|Safari|KHTML/.test(navigator.userAgent)) {
    Position.cumulativeOffset = function(element) {
        var valueT = 0, valueL = 0;
        do {
            valueT += element.offsetTop  || 0;
            valueL += element.offsetLeft || 0;
            if (element.offsetParent == document.body)
                if (Element.getStyle(element, 'position') == 'absolute') break;

            element = element.offsetParent;
        } while (element);

        return [valueL, valueT];
    }
}

Element.addMethods();
// ┌────────────────────────────────────────────────────────────────────┐ \\
// │ Raphaël 2.1.0 - JavaScript Vector Library                          │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright © 2008-2012 Dmitry Baranovskiy (http://raphaeljs.com)    │ \\
// │ Copyright © 2008-2012 Sencha Labs (http://sencha.com)              │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Licensed under the MIT (http://raphaeljs.com/license.html) license.│ \\
// └────────────────────────────────────────────────────────────────────┘ \\
// Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// ┌────────────────────────────────────────────────────────────┐ \\
// │ Eve 0.4.2 - JavaScript Events Library                      │ \\
// ├────────────────────────────────────────────────────────────┤ \\
// │ Author Dmitry Baranovskiy (http://dmitry.baranovskiy.com/) │ \\
// └────────────────────────────────────────────────────────────┘ \\

(function (glob) {
    var version = "0.4.2",
        has = "hasOwnProperty",
        separator = /[\.\/]/,
        wildcard = "*",
        fun = function () {},
        numsort = function (a, b) {
            return a - b;
        },
        current_event,
        stop,
        events = {n: {}},
    /*\
     * eve
     [ method ]

     * Fires event with given `name`, given scope and other parameters.

     > Arguments

     - name (string) name of the *event*, dot (`.`) or slash (`/`) separated
     - scope (object) context for the event handlers
     - varargs (...) the rest of arguments will be sent to event handlers

     = (object) array of returned values from the listeners
     \*/
        eve = function (name, scope) {
            name = String(name);
            var e = events,
                oldstop = stop,
                args = Array.prototype.slice.call(arguments, 2),
                listeners = eve.listeners(name),
                z = 0,
                f = false,
                l,
                indexed = [],
                queue = {},
                out = [],
                ce = current_event,
                errors = [];
            current_event = name;
            stop = 0;
            for (var i = 0, ii = listeners.length; i < ii; i++) if ("zIndex" in listeners[i]) {
                indexed.push(listeners[i].zIndex);
                if (listeners[i].zIndex < 0) {
                    queue[listeners[i].zIndex] = listeners[i];
                }
            }
            indexed.sort(numsort);
            while (indexed[z] < 0) {
                l = queue[indexed[z++]];
                out.push(l.apply(scope, args));
                if (stop) {
                    stop = oldstop;
                    return out;
                }
            }
            for (i = 0; i < ii; i++) {
                l = listeners[i];
                if ("zIndex" in l) {
                    if (l.zIndex == indexed[z]) {
                        out.push(l.apply(scope, args));
                        if (stop) {
                            break;
                        }
                        do {
                            z++;
                            l = queue[indexed[z]];
                            l && out.push(l.apply(scope, args));
                            if (stop) {
                                break;
                            }
                        } while (l)
                    } else {
                        queue[l.zIndex] = l;
                    }
                } else {
                    out.push(l.apply(scope, args));
                    if (stop) {
                        break;
                    }
                }
            }
            stop = oldstop;
            current_event = ce;
            return out.length ? out : null;
        };
    // Undocumented. Debug only.
    eve._events = events;
    /*\
     * eve.listeners
     [ method ]

     * Internal method which gives you array of all event handlers that will be triggered by the given `name`.

     > Arguments

     - name (string) name of the event, dot (`.`) or slash (`/`) separated

     = (array) array of event handlers
     \*/
    eve.listeners = function (name) {
        var names = name.split(separator),
            e = events,
            item,
            items,
            k,
            i,
            ii,
            j,
            jj,
            nes,
            es = [e],
            out = [];
        for (i = 0, ii = names.length; i < ii; i++) {
            nes = [];
            for (j = 0, jj = es.length; j < jj; j++) {
                e = es[j].n;
                items = [e[names[i]], e[wildcard]];
                k = 2;
                while (k--) {
                    item = items[k];
                    if (item) {
                        nes.push(item);
                        out = out.concat(item.f || []);
                    }
                }
            }
            es = nes;
        }
        return out;
    };

    /*\
     * eve.on
     [ method ]
     **
     * Binds given event handler with a given name. You can use wildcards “`*`” for the names:
     | eve.on("*.under.*", f);
     | eve("mouse.under.floor"); // triggers f
     * Use @eve to trigger the listener.
     **
     > Arguments
     **
     - name (string) name of the event, dot (`.`) or slash (`/`) separated, with optional wildcards
     - f (function) event handler function
     **
     = (function) returned function accepts a single numeric parameter that represents z-index of the handler. It is an optional feature and only used when you need to ensure that some subset of handlers will be invoked in a given order, despite of the order of assignment.
     > Example:
     | eve.on("mouse", eatIt)(2);
     | eve.on("mouse", scream);
     | eve.on("mouse", catchIt)(1);
     * This will ensure that `catchIt()` function will be called before `eatIt()`.
     *
     * If you want to put your handler before non-indexed handlers, specify a negative value.
     * Note: I assume most of the time you don’t need to worry about z-index, but it’s nice to have this feature “just in case”.
     \*/
    eve.on = function (name, f) {
        name = String(name);
        if (typeof f != "function") {
            return function () {};
        }
        var names = name.split(separator),
            e = events;
        for (var i = 0, ii = names.length; i < ii; i++) {
            e = e.n;
            e = e.hasOwnProperty(names[i]) && e[names[i]] || (e[names[i]] = {n: {}});
        }
        e.f = e.f || [];
        for (i = 0, ii = e.f.length; i < ii; i++) if (e.f[i] == f) {
            return fun;
        }
        e.f.push(f);
        return function (zIndex) {
            if (+zIndex == +zIndex) {
                f.zIndex = +zIndex;
            }
        };
    };
    /*\
     * eve.f
     [ method ]
     **
     * Returns function that will fire given event with optional arguments.
     * Arguments that will be passed to the result function will be also
     * concated to the list of final arguments.
     | el.onclick = eve.f("click", 1, 2);
     | eve.on("click", function (a, b, c) {
     |     console.log(a, b, c); // 1, 2, [event object]
     | });
     > Arguments
     - event (string) event name
     - varargs (…) and any other arguments
     = (function) possible event handler function
     \*/
    eve.f = function (event) {
        var attrs = [].slice.call(arguments, 1);
        return function () {
            eve.apply(null, [event, null].concat(attrs).concat([].slice.call(arguments, 0)));
        };
    };
    /*\
     * eve.stop
     [ method ]
     **
     * Is used inside an event handler to stop the event, preventing any subsequent listeners from firing.
     \*/
    eve.stop = function () {
        stop = 1;
    };
    /*\
     * eve.nt
     [ method ]
     **
     * Could be used inside event handler to figure out actual name of the event.
     **
     > Arguments
     **
     - subname (string) #optional subname of the event
     **
     = (string) name of the event, if `subname` is not specified
     * or
     = (boolean) `true`, if current event’s name contains `subname`
     \*/
    eve.nt = function (subname) {
        if (subname) {
            return new RegExp("(?:\\.|\\/|^)" + subname + "(?:\\.|\\/|$)").test(current_event);
        }
        return current_event;
    };
    /*\
     * eve.nts
     [ method ]
     **
     * Could be used inside event handler to figure out actual name of the event.
     **
     **
     = (array) names of the event
     \*/
    eve.nts = function () {
        return current_event.split(separator);
    };
    /*\
     * eve.off
     [ method ]
     **
     * Removes given function from the list of event listeners assigned to given name.
     * If no arguments specified all the events will be cleared.
     **
     > Arguments
     **
     - name (string) name of the event, dot (`.`) or slash (`/`) separated, with optional wildcards
     - f (function) event handler function
     \*/
    /*\
     * eve.unbind
     [ method ]
     **
     * See @eve.off
     \*/
    eve.off = eve.unbind = function (name, f) {
        if (!name) {
            eve._events = events = {n: {}};
            return;
        }
        var names = name.split(separator),
            e,
            key,
            splice,
            i, ii, j, jj,
            cur = [events];
        for (i = 0, ii = names.length; i < ii; i++) {
            for (j = 0; j < cur.length; j += splice.length - 2) {
                splice = [j, 1];
                e = cur[j].n;
                if (names[i] != wildcard) {
                    if (e[names[i]]) {
                        splice.push(e[names[i]]);
                    }
                } else {
                    for (key in e) if (e[has](key)) {
                        splice.push(e[key]);
                    }
                }
                cur.splice.apply(cur, splice);
            }
        }
        for (i = 0, ii = cur.length; i < ii; i++) {
            e = cur[i];
            while (e.n) {
                if (f) {
                    if (e.f) {
                        for (j = 0, jj = e.f.length; j < jj; j++) if (e.f[j] == f) {
                            e.f.splice(j, 1);
                            break;
                        }
                        !e.f.length && delete e.f;
                    }
                    for (key in e.n) if (e.n[has](key) && e.n[key].f) {
                        var funcs = e.n[key].f;
                        for (j = 0, jj = funcs.length; j < jj; j++) if (funcs[j] == f) {
                            funcs.splice(j, 1);
                            break;
                        }
                        !funcs.length && delete e.n[key].f;
                    }
                } else {
                    delete e.f;
                    for (key in e.n) if (e.n[has](key) && e.n[key].f) {
                        delete e.n[key].f;
                    }
                }
                e = e.n;
            }
        }
    };
    /*\
     * eve.once
     [ method ]
     **
     * Binds given event handler with a given name to only run once then unbind itself.
     | eve.once("login", f);
     | eve("login"); // triggers f
     | eve("login"); // no listeners
     * Use @eve to trigger the listener.
     **
     > Arguments
     **
     - name (string) name of the event, dot (`.`) or slash (`/`) separated, with optional wildcards
     - f (function) event handler function
     **
     = (function) same return function as @eve.on
     \*/
    eve.once = function (name, f) {
        var f2 = function () {
            eve.unbind(name, f2);
            return f.apply(this, arguments);
        };
        return eve.on(name, f2);
    };
    /*\
     * eve.version
     [ property (string) ]
     **
     * Current version of the library.
     \*/
    eve.version = version;
    eve.toString = function () {
        return "You are running Eve " + version;
    };
    (typeof module != "undefined" && module.exports) ? (module.exports = eve) : (typeof define != "undefined" ? (define("eve", [], function() { return eve; })) : (glob.eve = eve));
})(this);
// ┌─────────────────────────────────────────────────────────────────────┐ \\
// │ "Raphaël 2.1.0" - JavaScript Vector Library                         │ \\
// ├─────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright (c) 2008-2011 Dmitry Baranovskiy (http://raphaeljs.com)   │ \\
// │ Copyright (c) 2008-2011 Sencha Labs (http://sencha.com)             │ \\
// │ Licensed under the MIT (http://raphaeljs.com/license.html) license. │ \\
// └─────────────────────────────────────────────────────────────────────┘ \\

(function (glob, factory) {
    // AMD support
    if (typeof define === "function" && define.amd) {
        // Define as an anonymous module
        define(["eve"], function( eve ) {
            return factory(glob, eve);
        });
    } else {
        // Browser globals (glob is window)
        // Raphael adds itself to window
        factory(glob, glob.eve);
    }
}(this, function (window, eve) {
    /*\
     * Raphael
     [ method ]
     **
     * Creates a canvas object on which to draw.
     * You must do this first, as all future calls to drawing methods
     * from this instance will be bound to this canvas.
     > Parameters
     **
     - container (HTMLElement|string) DOM element or its ID which is going to be a parent for drawing surface
     - width (number)
     - height (number)
     - callback (function) #optional callback function which is going to be executed in the context of newly created paper
     * or
     - x (number)
     - y (number)
     - width (number)
     - height (number)
     - callback (function) #optional callback function which is going to be executed in the context of newly created paper
     * or
     - all (array) (first 3 or 4 elements in the array are equal to [containerID, width, height] or [x, y, width, height]. The rest are element descriptions in format {type: type, <attributes>}). See @Paper.add.
     - callback (function) #optional callback function which is going to be executed in the context of newly created paper
     * or
     - onReadyCallback (function) function that is going to be called on DOM ready event. You can also subscribe to this event via Eve’s “DOMLoad” event. In this case method returns `undefined`.
     = (object) @Paper
     > Usage
     | // Each of the following examples create a canvas
     | // that is 320px wide by 200px high.
     | // Canvas is created at the viewport’s 10,50 coordinate.
     | var paper = Raphael(10, 50, 320, 200);
     | // Canvas is created at the top left corner of the #notepad element
     | // (or its top right corner in dir="rtl" elements)
     | var paper = Raphael(document.getElementById("notepad"), 320, 200);
     | // Same as above
     | var paper = Raphael("notepad", 320, 200);
     | // Image dump
     | var set = Raphael(["notepad", 320, 200, {
     |     type: "rect",
     |     x: 10,
     |     y: 10,
     |     width: 25,
     |     height: 25,
     |     stroke: "#f00"
     | }, {
     |     type: "text",
     |     x: 30,
     |     y: 40,
     |     text: "Dump"
     | }]);
     \*/
    function R(first) {
        if (R.is(first, "function")) {
            return loaded ? first() : eve.on("raphael.DOMload", first);
        } else if (R.is(first, array)) {
            return R._engine.create[apply](R, first.splice(0, 3 + R.is(first[0], nu))).add(first);
        } else {
            var args = Array.prototype.slice.call(arguments, 0);
            if (R.is(args[args.length - 1], "function")) {
                var f = args.pop();
                return loaded ? f.call(R._engine.create[apply](R, args)) : eve.on("raphael.DOMload", function () {
                    f.call(R._engine.create[apply](R, args));
                });
            } else {
                return R._engine.create[apply](R, arguments);
            }
        }
    }
    R.version = "2.1.0";
    R.eve = eve;
    var loaded,
        separator = /[, ]+/,
        elements = {circle: 1, rect: 1, path: 1, ellipse: 1, text: 1, image: 1},
        formatrg = /\{(\d+)\}/g,
        proto = "prototype",
        has = "hasOwnProperty",
        g = {
            doc: document,
            win: window
        },
        oldRaphael = {
            was: Object.prototype[has].call(g.win, "Raphael"),
            is: g.win.Raphael
        },
        Paper = function () {
            /*\
             * Paper.ca
             [ property (object) ]
             **
             * Shortcut for @Paper.customAttributes
             \*/
            /*\
             * Paper.customAttributes
             [ property (object) ]
             **
             * If you have a set of attributes that you would like to represent
             * as a function of some number you can do it easily with custom attributes:
             > Usage
             | paper.customAttributes.hue = function (num) {
             |     num = num % 1;
             |     return {fill: "hsb(" + num + ", 0.75, 1)"};
             | };
             | // Custom attribute “hue” will change fill
             | // to be given hue with fixed saturation and brightness.
             | // Now you can use it like this:
             | var c = paper.circle(10, 10, 10).attr({hue: .45});
             | // or even like this:
             | c.animate({hue: 1}, 1e3);
             |
             | // You could also create custom attribute
             | // with multiple parameters:
             | paper.customAttributes.hsb = function (h, s, b) {
             |     return {fill: "hsb(" + [h, s, b].join(",") + ")"};
             | };
             | c.attr({hsb: "0.5 .8 1"});
             | c.animate({hsb: [1, 0, 0.5]}, 1e3);
             \*/
            this.ca = this.customAttributes = {};
        },
        paperproto,
        appendChild = "appendChild",
        apply = "apply",
        concat = "concat",
        supportsTouch = ('ontouchstart' in g.win) || g.win.DocumentTouch && g.doc instanceof DocumentTouch, //taken from Modernizr touch test
        E = "",
        S = " ",
        Str = String,
        split = "split",
        events = "click dblclick mousedown mousemove mouseout mouseover mouseup touchstart touchmove touchend touchcancel"[split](S),
        touchMap = {
            mousedown: "touchstart",
            mousemove: "touchmove",
            mouseup: "touchend"
        },
        lowerCase = Str.prototype.toLowerCase,
        math = Math,
        mmax = math.max,
        mmin = math.min,
        abs = math.abs,
        pow = math.pow,
        PI = math.PI,
        nu = "number",
        string = "string",
        array = "array",
        toString = "toString",
        fillString = "fill",
        objectToString = Object.prototype.toString,
        paper = {},
        push = "push",
        ISURL = R._ISURL = /^url\(['"]?([^\)]+?)['"]?\)$/i,
        colourRegExp = /^\s*((#[a-f\d]{6})|(#[a-f\d]{3})|rgba?\(\s*([\d\.]+%?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+%?(?:\s*,\s*[\d\.]+%?)?)\s*\)|hsba?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\)|hsla?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\))\s*$/i,
        isnan = {"NaN": 1, "Infinity": 1, "-Infinity": 1},
        bezierrg = /^(?:cubic-)?bezier\(([^,]+),([^,]+),([^,]+),([^\)]+)\)/,
        round = math.round,
        setAttribute = "setAttribute",
        toFloat = parseFloat,
        toInt = parseInt,
        upperCase = Str.prototype.toUpperCase,
        availableAttrs = R._availableAttrs = {
            "arrow-end": "none",
            "arrow-start": "none",
            blur: 0,
            "clip-rect": "0 0 1e9 1e9",
            cursor: "default",
            cx: 0,
            cy: 0,
            fill: "#fff",
            "fill-opacity": 1,
            font: '10px "Arial"',
            "font-family": '"Arial"',
            "font-size": "10",
            "font-style": "normal",
            "font-weight": 400,
            gradient: 0,
            height: 0,
            href: "http://raphaeljs.com/",
            "letter-spacing": 0,
            opacity: 1,
            path: "M0,0",
            r: 0,
            rx: 0,
            ry: 0,
            src: "",
            stroke: "#000",
            "stroke-dasharray": "",
            "stroke-linecap": "butt",
            "stroke-linejoin": "butt",
            "stroke-miterlimit": 0,
            "stroke-opacity": 1,
            "stroke-width": 1,
            target: "_blank",
            "text-anchor": "middle",
            title: "Raphael",
            transform: "",
            width: 0,
            x: 0,
            y: 0
        },
        availableAnimAttrs = R._availableAnimAttrs = {
            blur: nu,
            "clip-rect": "csv",
            cx: nu,
            cy: nu,
            fill: "colour",
            "fill-opacity": nu,
            "font-size": nu,
            height: nu,
            opacity: nu,
            path: "path",
            r: nu,
            rx: nu,
            ry: nu,
            stroke: "colour",
            "stroke-opacity": nu,
            "stroke-width": nu,
            transform: "transform",
            width: nu,
            x: nu,
            y: nu
        },
        whitespace = /[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]/g,
        commaSpaces = /[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*/,
        hsrg = {hs: 1, rg: 1},
        p2s = /,?([achlmqrstvxz]),?/gi,
        pathCommand = /([achlmrqstvz])[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*)+)/ig,
        tCommand = /([rstm])[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*)+)/ig,
        pathValues = /(-?\d*\.?\d*(?:e[\-+]?\d+)?)[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*/ig,
        radial_gradient = R._radial_gradient = /^r(?:\(([^,]+?)[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*([^\)]+?)\))?/,
        eldata = {},
        sortByKey = function (a, b) {
            return a.key - b.key;
        },
        sortByNumber = function (a, b) {
            return toFloat(a) - toFloat(b);
        },
        fun = function () {},
        pipe = function (x) {
            return x;
        },
        rectPath = R._rectPath = function (x, y, w, h, r) {
            if (r) {
                return [["M", x + r, y], ["l", w - r * 2, 0], ["a", r, r, 0, 0, 1, r, r], ["l", 0, h - r * 2], ["a", r, r, 0, 0, 1, -r, r], ["l", r * 2 - w, 0], ["a", r, r, 0, 0, 1, -r, -r], ["l", 0, r * 2 - h], ["a", r, r, 0, 0, 1, r, -r], ["z"]];
            }
            return [["M", x, y], ["l", w, 0], ["l", 0, h], ["l", -w, 0], ["z"]];
        },
        ellipsePath = function (x, y, rx, ry) {
            if (ry == null) {
                ry = rx;
            }
            return [["M", x, y], ["m", 0, -ry], ["a", rx, ry, 0, 1, 1, 0, 2 * ry], ["a", rx, ry, 0, 1, 1, 0, -2 * ry], ["z"]];
        },
        getPath = R._getPath = {
            path: function (el) {
                return el.attr("path");
            },
            circle: function (el) {
                var a = el.attrs;
                return ellipsePath(a.cx, a.cy, a.r);
            },
            ellipse: function (el) {
                var a = el.attrs;
                return ellipsePath(a.cx, a.cy, a.rx, a.ry);
            },
            rect: function (el) {
                var a = el.attrs;
                return rectPath(a.x, a.y, a.width, a.height, a.r);
            },
            image: function (el) {
                var a = el.attrs;
                return rectPath(a.x, a.y, a.width, a.height);
            },
            text: function (el) {
                var bbox = el._getBBox();
                return rectPath(bbox.x, bbox.y, bbox.width, bbox.height);
            },
            set : function(el) {
                var bbox = el._getBBox();
                return rectPath(bbox.x, bbox.y, bbox.width, bbox.height);
            }
        },
    /*\
     * Raphael.mapPath
     [ method ]
     **
     * Transform the path string with given matrix.
     > Parameters
     - path (string) path string
     - matrix (object) see @Matrix
     = (string) transformed path string
     \*/
        mapPath = R.mapPath = function (path, matrix) {
            if (!matrix) {
                return path;
            }
            var x, y, i, j, ii, jj, pathi;
            path = path2curve(path);
            for (i = 0, ii = path.length; i < ii; i++) {
                pathi = path[i];
                for (j = 1, jj = pathi.length; j < jj; j += 2) {
                    x = matrix.x(pathi[j], pathi[j + 1]);
                    y = matrix.y(pathi[j], pathi[j + 1]);
                    pathi[j] = x;
                    pathi[j + 1] = y;
                }
            }
            return path;
        };

    R._g = g;
    /*\
     * Raphael.type
     [ property (string) ]
     **
     * Can be “SVG”, “VML” or empty, depending on browser support.
     \*/
    R.type = (g.win.SVGAngle || g.doc.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1") ? "SVG" : "VML");
    if (R.type == "VML") {
        var d = g.doc.createElement("div"),
            b;
        d.innerHTML = '<v:shape adj="1"/>';
        b = d.firstChild;
        b.style.behavior = "url(#default#VML)";
        if (!(b && typeof b.adj == "object")) {
            return (R.type = E);
        }
        d = null;
    }
    /*\
     * Raphael.svg
     [ property (boolean) ]
     **
     * `true` if browser supports SVG.
     \*/
    /*\
     * Raphael.vml
     [ property (boolean) ]
     **
     * `true` if browser supports VML.
     \*/
    R.svg = !(R.vml = R.type == "VML");
    R._Paper = Paper;
    /*\
     * Raphael.fn
     [ property (object) ]
     **
     * You can add your own method to the canvas. For example if you want to draw a pie chart,
     * you can create your own pie chart function and ship it as a Raphaël plugin. To do this
     * you need to extend the `Raphael.fn` object. You should modify the `fn` object before a
     * Raphaël instance is created, otherwise it will take no effect. Please note that the
     * ability for namespaced plugins was removed in Raphael 2.0. It is up to the plugin to
     * ensure any namespacing ensures proper context.
     > Usage
     | Raphael.fn.arrow = function (x1, y1, x2, y2, size) {
     |     return this.path( ... );
     | };
     | // or create namespace
     | Raphael.fn.mystuff = {
     |     arrow: function () {…},
     |     star: function () {…},
     |     // etc…
     | };
     | var paper = Raphael(10, 10, 630, 480);
     | // then use it
     | paper.arrow(10, 10, 30, 30, 5).attr({fill: "#f00"});
     | paper.mystuff.arrow();
     | paper.mystuff.star();
     \*/
    R.fn = paperproto = Paper.prototype = R.prototype;
    R._id = 0;
    R._oid = 0;
    /*\
     * Raphael.is
     [ method ]
     **
     * Handfull replacement for `typeof` operator.
     > Parameters
     - o (…) any object or primitive
     - type (string) name of the type, i.e. “string”, “function”, “number”, etc.
     = (boolean) is given value is of given type
     \*/
    R.is = function (o, type) {
        type = lowerCase.call(type);
        if (type == "finite") {
            return !isnan[has](+o);
        }
        if (type == "array") {
            return o instanceof Array;
        }
        return  (type == "null" && o === null) ||
            (type == typeof o && o !== null) ||
            (type == "object" && o === Object(o)) ||
            (type == "array" && Array.isArray && Array.isArray(o)) ||
            objectToString.call(o).slice(8, -1).toLowerCase() == type;
    };

    function clone(obj) {
        if (Object(obj) !== obj) {
            return obj;
        }
        var res = new obj.constructor;
        for (var key in obj) if (obj[has](key)) {
            res[key] = clone(obj[key]);
        }
        return res;
    }

    /*\
     * Raphael.angle
     [ method ]
     **
     * Returns angle between two or three points
     > Parameters
     - x1 (number) x coord of first point
     - y1 (number) y coord of first point
     - x2 (number) x coord of second point
     - y2 (number) y coord of second point
     - x3 (number) #optional x coord of third point
     - y3 (number) #optional y coord of third point
     = (number) angle in degrees.
     \*/
    R.angle = function (x1, y1, x2, y2, x3, y3) {
        if (x3 == null) {
            var x = x1 - x2,
                y = y1 - y2;
            if (!x && !y) {
                return 0;
            }
            return (180 + math.atan2(-y, -x) * 180 / PI + 360) % 360;
        } else {
            return R.angle(x1, y1, x3, y3) - R.angle(x2, y2, x3, y3);
        }
    };
    /*\
     * Raphael.rad
     [ method ]
     **
     * Transform angle to radians
     > Parameters
     - deg (number) angle in degrees
     = (number) angle in radians.
     \*/
    R.rad = function (deg) {
        return deg % 360 * PI / 180;
    };
    /*\
     * Raphael.deg
     [ method ]
     **
     * Transform angle to degrees
     > Parameters
     - deg (number) angle in radians
     = (number) angle in degrees.
     \*/
    R.deg = function (rad) {
        return rad * 180 / PI % 360;
    };
    /*\
     * Raphael.snapTo
     [ method ]
     **
     * Snaps given value to given grid.
     > Parameters
     - values (array|number) given array of values or step of the grid
     - value (number) value to adjust
     - tolerance (number) #optional tolerance for snapping. Default is `10`.
     = (number) adjusted value.
     \*/
    R.snapTo = function (values, value, tolerance) {
        tolerance = R.is(tolerance, "finite") ? tolerance : 10;
        if (R.is(values, array)) {
            var i = values.length;
            while (i--) if (abs(values[i] - value) <= tolerance) {
                return values[i];
            }
        } else {
            values = +values;
            var rem = value % values;
            if (rem < tolerance) {
                return value - rem;
            }
            if (rem > values - tolerance) {
                return value - rem + values;
            }
        }
        return value;
    };

    /*\
     * Raphael.createUUID
     [ method ]
     **
     * Returns RFC4122, version 4 ID
     \*/
    var createUUID = R.createUUID = (function (uuidRegEx, uuidReplacer) {
        return function () {
            return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(uuidRegEx, uuidReplacer).toUpperCase();
        };
    })(/[xy]/g, function (c) {
        var r = math.random() * 16 | 0,
            v = c == "x" ? r : (r & 3 | 8);
        return v.toString(16);
    });

    /*\
     * Raphael.setWindow
     [ method ]
     **
     * Used when you need to draw in `&lt;iframe>`. Switched window to the iframe one.
     > Parameters
     - newwin (window) new window object
     \*/
    R.setWindow = function (newwin) {
        eve("raphael.setWindow", R, g.win, newwin);
        g.win = newwin;
        g.doc = g.win.document;
        if (R._engine.initWin) {
            R._engine.initWin(g.win);
        }
    };
    var toHex = function (color) {
            if (R.vml) {
                // http://dean.edwards.name/weblog/2009/10/convert-any-colour-value-to-hex-in-msie/
                var trim = /^\s+|\s+$/g;
                var bod;
                try {
                    var docum = new ActiveXObject("htmlfile");
                    docum.write("<body>");
                    docum.close();
                    bod = docum.body;
                } catch(e) {
                    bod = createPopup().document.body;
                }
                var range = bod.createTextRange();
                toHex = cacher(function (color) {
                    try {
                        bod.style.color = Str(color).replace(trim, E);
                        var value = range.queryCommandValue("ForeColor");
                        value = ((value & 255) << 16) | (value & 65280) | ((value & 16711680) >>> 16);
                        return "#" + ("000000" + value.toString(16)).slice(-6);
                    } catch(e) {
                        return "none";
                    }
                });
            } else {
                var i = g.doc.createElement("i");
                i.title = "Rapha\xebl Colour Picker";
                i.style.display = "none";
                g.doc.body.appendChild(i);
                toHex = cacher(function (color) {
                    i.style.color = color;
                    return g.doc.defaultView.getComputedStyle(i, E).getPropertyValue("color");
                });
            }
            return toHex(color);
        },
        hsbtoString = function () {
            return "hsb(" + [this.h, this.s, this.b] + ")";
        },
        hsltoString = function () {
            return "hsl(" + [this.h, this.s, this.l] + ")";
        },
        rgbtoString = function () {
            return this.hex;
        },
        prepareRGB = function (r, g, b) {
            if (g == null && R.is(r, "object") && "r" in r && "g" in r && "b" in r) {
                b = r.b;
                g = r.g;
                r = r.r;
            }
            if (g == null && R.is(r, string)) {
                var clr = R.getRGB(r);
                r = clr.r;
                g = clr.g;
                b = clr.b;
            }
            if (r > 1 || g > 1 || b > 1) {
                r /= 255;
                g /= 255;
                b /= 255;
            }

            return [r, g, b];
        },
        packageRGB = function (r, g, b, o) {
            r *= 255;
            g *= 255;
            b *= 255;
            var rgb = {
                r: r,
                g: g,
                b: b,
                hex: R.rgb(r, g, b),
                toString: rgbtoString
            };
            R.is(o, "finite") && (rgb.opacity = o);
            return rgb;
        };

    /*\
     * Raphael.color
     [ method ]
     **
     * Parses the color string and returns object with all values for the given color.
     > Parameters
     - clr (string) color string in one of the supported formats (see @Raphael.getRGB)
     = (object) Combined RGB & HSB object in format:
     o {
     o     r (number) red,
     o     g (number) green,
     o     b (number) blue,
     o     hex (string) color in HTML/CSS format: #••••••,
     o     error (boolean) `true` if string can’t be parsed,
     o     h (number) hue,
     o     s (number) saturation,
     o     v (number) value (brightness),
     o     l (number) lightness
     o }
     \*/
    R.color = function (clr) {
        var rgb;
        if (R.is(clr, "object") && "h" in clr && "s" in clr && "b" in clr) {
            rgb = R.hsb2rgb(clr);
            clr.r = rgb.r;
            clr.g = rgb.g;
            clr.b = rgb.b;
            clr.hex = rgb.hex;
        } else if (R.is(clr, "object") && "h" in clr && "s" in clr && "l" in clr) {
            rgb = R.hsl2rgb(clr);
            clr.r = rgb.r;
            clr.g = rgb.g;
            clr.b = rgb.b;
            clr.hex = rgb.hex;
        } else {
            if (R.is(clr, "string")) {
                clr = R.getRGB(clr);
            }
            if (R.is(clr, "object") && "r" in clr && "g" in clr && "b" in clr) {
                rgb = R.rgb2hsl(clr);
                clr.h = rgb.h;
                clr.s = rgb.s;
                clr.l = rgb.l;
                rgb = R.rgb2hsb(clr);
                clr.v = rgb.b;
            } else {
                clr = {hex: "none"};
                clr.r = clr.g = clr.b = clr.h = clr.s = clr.v = clr.l = -1;
            }
        }
        clr.toString = rgbtoString;
        return clr;
    };
    /*\
     * Raphael.hsb2rgb
     [ method ]
     **
     * Converts HSB values to RGB object.
     > Parameters
     - h (number) hue
     - s (number) saturation
     - v (number) value or brightness
     = (object) RGB object in format:
     o {
     o     r (number) red,
     o     g (number) green,
     o     b (number) blue,
     o     hex (string) color in HTML/CSS format: #••••••
     o }
     \*/
    R.hsb2rgb = function (h, s, v, o) {
        if (this.is(h, "object") && "h" in h && "s" in h && "b" in h) {
            v = h.b;
            s = h.s;
            h = h.h;
            o = h.o;
        }
        h *= 360;
        var R, G, B, X, C;
        h = (h % 360) / 60;
        C = v * s;
        X = C * (1 - abs(h % 2 - 1));
        R = G = B = v - C;

        h = ~~h;
        R += [C, X, 0, 0, X, C][h];
        G += [X, C, C, X, 0, 0][h];
        B += [0, 0, X, C, C, X][h];
        return packageRGB(R, G, B, o);
    };
    /*\
     * Raphael.hsl2rgb
     [ method ]
     **
     * Converts HSL values to RGB object.
     > Parameters
     - h (number) hue
     - s (number) saturation
     - l (number) luminosity
     = (object) RGB object in format:
     o {
     o     r (number) red,
     o     g (number) green,
     o     b (number) blue,
     o     hex (string) color in HTML/CSS format: #••••••
     o }
     \*/
    R.hsl2rgb = function (h, s, l, o) {
        if (this.is(h, "object") && "h" in h && "s" in h && "l" in h) {
            l = h.l;
            s = h.s;
            h = h.h;
        }
        if (h > 1 || s > 1 || l > 1) {
            h /= 360;
            s /= 100;
            l /= 100;
        }
        h *= 360;
        var R, G, B, X, C;
        h = (h % 360) / 60;
        C = 2 * s * (l < .5 ? l : 1 - l);
        X = C * (1 - abs(h % 2 - 1));
        R = G = B = l - C / 2;

        h = ~~h;
        R += [C, X, 0, 0, X, C][h];
        G += [X, C, C, X, 0, 0][h];
        B += [0, 0, X, C, C, X][h];
        return packageRGB(R, G, B, o);
    };
    /*\
     * Raphael.rgb2hsb
     [ method ]
     **
     * Converts RGB values to HSB object.
     > Parameters
     - r (number) red
     - g (number) green
     - b (number) blue
     = (object) HSB object in format:
     o {
     o     h (number) hue
     o     s (number) saturation
     o     b (number) brightness
     o }
     \*/
    R.rgb2hsb = function (r, g, b) {
        b = prepareRGB(r, g, b);
        r = b[0];
        g = b[1];
        b = b[2];

        var H, S, V, C;
        V = mmax(r, g, b);
        C = V - mmin(r, g, b);
        H = (C == 0 ? null :
                V == r ? (g - b) / C :
                    V == g ? (b - r) / C + 2 :
                    (r - g) / C + 4
        );
        H = ((H + 360) % 6) * 60 / 360;
        S = C == 0 ? 0 : C / V;
        return {h: H, s: S, b: V, toString: hsbtoString};
    };
    /*\
     * Raphael.rgb2hsl
     [ method ]
     **
     * Converts RGB values to HSL object.
     > Parameters
     - r (number) red
     - g (number) green
     - b (number) blue
     = (object) HSL object in format:
     o {
     o     h (number) hue
     o     s (number) saturation
     o     l (number) luminosity
     o }
     \*/
    R.rgb2hsl = function (r, g, b) {
        b = prepareRGB(r, g, b);
        r = b[0];
        g = b[1];
        b = b[2];

        var H, S, L, M, m, C;
        M = mmax(r, g, b);
        m = mmin(r, g, b);
        C = M - m;
        H = (C == 0 ? null :
            M == r ? (g - b) / C :
                M == g ? (b - r) / C + 2 :
                (r - g) / C + 4);
        H = ((H + 360) % 6) * 60 / 360;
        L = (M + m) / 2;
        S = (C == 0 ? 0 :
            L < .5 ? C / (2 * L) :
            C / (2 - 2 * L));
        return {h: H, s: S, l: L, toString: hsltoString};
    };
    R._path2string = function () {
        return this.join(",").replace(p2s, "$1");
    };
    function repush(array, item) {
        for (var i = 0, ii = array.length; i < ii; i++) if (array[i] === item) {
            return array.push(array.splice(i, 1)[0]);
        }
    }
    function cacher(f, scope, postprocessor) {
        function newf() {
            var arg = Array.prototype.slice.call(arguments, 0),
                args = arg.join("\u2400"),
                cache = newf.cache = newf.cache || {},
                count = newf.count = newf.count || [];
            if (cache[has](args)) {
                repush(count, args);
                return postprocessor ? postprocessor(cache[args]) : cache[args];
            }
            count.length >= 1e3 && delete cache[count.shift()];
            count.push(args);
            cache[args] = f[apply](scope, arg);
            return postprocessor ? postprocessor(cache[args]) : cache[args];
        }
        return newf;
    }

    var preload = R._preload = function (src, f) {
        var img = g.doc.createElement("img");
        img.style.cssText = "position:absolute;left:-9999em;top:-9999em";
        img.onload = function () {
            f.call(this);
            this.onload = null;
            g.doc.body.removeChild(this);
        };
        img.onerror = function () {
            g.doc.body.removeChild(this);
        };
        g.doc.body.appendChild(img);
        img.src = src;
    };

    function clrToString() {
        return this.hex;
    }

    /*\
     * Raphael.getRGB
     [ method ]
     **
     * Parses colour string as RGB object
     > Parameters
     - colour (string) colour string in one of formats:
     # <ul>
     #     <li>Colour name (“<code>red</code>”, “<code>green</code>”, “<code>cornflowerblue</code>”, etc)</li>
     #     <li>#••• — shortened HTML colour: (“<code>#000</code>”, “<code>#fc0</code>”, etc)</li>
     #     <li>#•••••• — full length HTML colour: (“<code>#000000</code>”, “<code>#bd2300</code>”)</li>
     #     <li>rgb(•••, •••, •••) — red, green and blue channels’ values: (“<code>rgb(200,&nbsp;100,&nbsp;0)</code>”)</li>
     #     <li>rgb(•••%, •••%, •••%) — same as above, but in %: (“<code>rgb(100%,&nbsp;175%,&nbsp;0%)</code>”)</li>
     #     <li>hsb(•••, •••, •••) — hue, saturation and brightness values: (“<code>hsb(0.5,&nbsp;0.25,&nbsp;1)</code>”)</li>
     #     <li>hsb(•••%, •••%, •••%) — same as above, but in %</li>
     #     <li>hsl(•••, •••, •••) — same as hsb</li>
     #     <li>hsl(•••%, •••%, •••%) — same as hsb</li>
     # </ul>
     = (object) RGB object in format:
     o {
     o     r (number) red,
     o     g (number) green,
     o     b (number) blue
     o     hex (string) color in HTML/CSS format: #••••••,
     o     error (boolean) true if string can’t be parsed
     o }
     \*/
    R.getRGB = cacher(function (colour) {
        if (!colour || !!((colour = Str(colour)).indexOf("-") + 1)) {
            return {r: -1, g: -1, b: -1, hex: "none", error: 1, toString: clrToString};
        }
        if (colour == "none") {
            return {r: -1, g: -1, b: -1, hex: "none", toString: clrToString};
        }
        !(hsrg[has](colour.toLowerCase().substring(0, 2)) || colour.charAt() == "#") && (colour = toHex(colour));
        var res,
            red,
            green,
            blue,
            opacity,
            t,
            values,
            rgb = colour.match(colourRegExp);
        if (rgb) {
            if (rgb[2]) {
                blue = toInt(rgb[2].substring(5), 16);
                green = toInt(rgb[2].substring(3, 5), 16);
                red = toInt(rgb[2].substring(1, 3), 16);
            }
            if (rgb[3]) {
                blue = toInt((t = rgb[3].charAt(3)) + t, 16);
                green = toInt((t = rgb[3].charAt(2)) + t, 16);
                red = toInt((t = rgb[3].charAt(1)) + t, 16);
            }
            if (rgb[4]) {
                values = rgb[4][split](commaSpaces);
                red = toFloat(values[0]);
                values[0].slice(-1) == "%" && (red *= 2.55);
                green = toFloat(values[1]);
                values[1].slice(-1) == "%" && (green *= 2.55);
                blue = toFloat(values[2]);
                values[2].slice(-1) == "%" && (blue *= 2.55);
                rgb[1].toLowerCase().slice(0, 4) == "rgba" && (opacity = toFloat(values[3]));
                values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
            }
            if (rgb[5]) {
                values = rgb[5][split](commaSpaces);
                red = toFloat(values[0]);
                values[0].slice(-1) == "%" && (red *= 2.55);
                green = toFloat(values[1]);
                values[1].slice(-1) == "%" && (green *= 2.55);
                blue = toFloat(values[2]);
                values[2].slice(-1) == "%" && (blue *= 2.55);
                (values[0].slice(-3) == "deg" || values[0].slice(-1) == "\xb0") && (red /= 360);
                rgb[1].toLowerCase().slice(0, 4) == "hsba" && (opacity = toFloat(values[3]));
                values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
                return R.hsb2rgb(red, green, blue, opacity);
            }
            if (rgb[6]) {
                values = rgb[6][split](commaSpaces);
                red = toFloat(values[0]);
                values[0].slice(-1) == "%" && (red *= 2.55);
                green = toFloat(values[1]);
                values[1].slice(-1) == "%" && (green *= 2.55);
                blue = toFloat(values[2]);
                values[2].slice(-1) == "%" && (blue *= 2.55);
                (values[0].slice(-3) == "deg" || values[0].slice(-1) == "\xb0") && (red /= 360);
                rgb[1].toLowerCase().slice(0, 4) == "hsla" && (opacity = toFloat(values[3]));
                values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
                return R.hsl2rgb(red, green, blue, opacity);
            }
            rgb = {r: red, g: green, b: blue, toString: clrToString};
            rgb.hex = "#" + (16777216 | blue | (green << 8) | (red << 16)).toString(16).slice(1);
            R.is(opacity, "finite") && (rgb.opacity = opacity);
            return rgb;
        }
        return {r: -1, g: -1, b: -1, hex: "none", error: 1, toString: clrToString};
    }, R);
    /*\
     * Raphael.hsb
     [ method ]
     **
     * Converts HSB values to hex representation of the colour.
     > Parameters
     - h (number) hue
     - s (number) saturation
     - b (number) value or brightness
     = (string) hex representation of the colour.
     \*/
    R.hsb = cacher(function (h, s, b) {
        return R.hsb2rgb(h, s, b).hex;
    });
    /*\
     * Raphael.hsl
     [ method ]
     **
     * Converts HSL values to hex representation of the colour.
     > Parameters
     - h (number) hue
     - s (number) saturation
     - l (number) luminosity
     = (string) hex representation of the colour.
     \*/
    R.hsl = cacher(function (h, s, l) {
        return R.hsl2rgb(h, s, l).hex;
    });
    /*\
     * Raphael.rgb
     [ method ]
     **
     * Converts RGB values to hex representation of the colour.
     > Parameters
     - r (number) red
     - g (number) green
     - b (number) blue
     = (string) hex representation of the colour.
     \*/
    R.rgb = cacher(function (r, g, b) {
        return "#" + (16777216 | b | (g << 8) | (r << 16)).toString(16).slice(1);
    });
    /*\
     * Raphael.getColor
     [ method ]
     **
     * On each call returns next colour in the spectrum. To reset it back to red call @Raphael.getColor.reset
     > Parameters
     - value (number) #optional brightness, default is `0.75`
     = (string) hex representation of the colour.
     \*/
    R.getColor = function (value) {
        var start = this.getColor.start = this.getColor.start || {h: 0, s: 1, b: value || .75},
            rgb = this.hsb2rgb(start.h, start.s, start.b);
        start.h += .075;
        if (start.h > 1) {
            start.h = 0;
            start.s -= .2;
            start.s <= 0 && (this.getColor.start = {h: 0, s: 1, b: start.b});
        }
        return rgb.hex;
    };
    /*\
     * Raphael.getColor.reset
     [ method ]
     **
     * Resets spectrum position for @Raphael.getColor back to red.
     \*/
    R.getColor.reset = function () {
        delete this.start;
    };

    // http://schepers.cc/getting-to-the-point
    function catmullRom2bezier(crp, z) {
        var d = [];
        for (var i = 0, iLen = crp.length; iLen - 2 * !z > i; i += 2) {
            var p = [
                {x: +crp[i - 2], y: +crp[i - 1]},
                {x: +crp[i],     y: +crp[i + 1]},
                {x: +crp[i + 2], y: +crp[i + 3]},
                {x: +crp[i + 4], y: +crp[i + 5]}
            ];
            if (z) {
                if (!i) {
                    p[0] = {x: +crp[iLen - 2], y: +crp[iLen - 1]};
                } else if (iLen - 4 == i) {
                    p[3] = {x: +crp[0], y: +crp[1]};
                } else if (iLen - 2 == i) {
                    p[2] = {x: +crp[0], y: +crp[1]};
                    p[3] = {x: +crp[2], y: +crp[3]};
                }
            } else {
                if (iLen - 4 == i) {
                    p[3] = p[2];
                } else if (!i) {
                    p[0] = {x: +crp[i], y: +crp[i + 1]};
                }
            }
            d.push(["C",
                (-p[0].x + 6 * p[1].x + p[2].x) / 6,
                (-p[0].y + 6 * p[1].y + p[2].y) / 6,
                (p[1].x + 6 * p[2].x - p[3].x) / 6,
                (p[1].y + 6*p[2].y - p[3].y) / 6,
                p[2].x,
                p[2].y
            ]);
        }

        return d;
    }
    /*\
     * Raphael.parsePathString
     [ method ]
     **
     * Utility method
     **
     * Parses given path string into an array of arrays of path segments.
     > Parameters
     - pathString (string|array) path string or array of segments (in the last case it will be returned straight away)
     = (array) array of segments.
     \*/
    R.parsePathString = function (pathString) {
        if (!pathString) {
            return null;
        }
        var pth = paths(pathString);
        if (pth.arr) {
            return pathClone(pth.arr);
        }

        var paramCounts = {a: 7, c: 6, h: 1, l: 2, m: 2, r: 4, q: 4, s: 4, t: 2, v: 1, z: 0},
            data = [];
        if (R.is(pathString, array) && R.is(pathString[0], array)) { // rough assumption
            data = pathClone(pathString);
        }
        if (!data.length) {
            Str(pathString).replace(pathCommand, function (a, b, c) {
                var params = [],
                    name = b.toLowerCase();
                c.replace(pathValues, function (a, b) {
                    b && params.push(+b);
                });
                if (name == "m" && params.length > 2) {
                    data.push([b][concat](params.splice(0, 2)));
                    name = "l";
                    b = b == "m" ? "l" : "L";
                }
                if (name == "r") {
                    data.push([b][concat](params));
                } else while (params.length >= paramCounts[name]) {
                    data.push([b][concat](params.splice(0, paramCounts[name])));
                    if (!paramCounts[name]) {
                        break;
                    }
                }
            });
        }
        data.toString = R._path2string;
        pth.arr = pathClone(data);
        return data;
    };
    /*\
     * Raphael.parseTransformString
     [ method ]
     **
     * Utility method
     **
     * Parses given path string into an array of transformations.
     > Parameters
     - TString (string|array) transform string or array of transformations (in the last case it will be returned straight away)
     = (array) array of transformations.
     \*/
    R.parseTransformString = cacher(function (TString) {
        if (!TString) {
            return null;
        }
        var paramCounts = {r: 3, s: 4, t: 2, m: 6},
            data = [];
        if (R.is(TString, array) && R.is(TString[0], array)) { // rough assumption
            data = pathClone(TString);
        }
        if (!data.length) {
            Str(TString).replace(tCommand, function (a, b, c) {
                var params = [],
                    name = lowerCase.call(b);
                c.replace(pathValues, function (a, b) {
                    b && params.push(+b);
                });
                data.push([b][concat](params));
            });
        }
        data.toString = R._path2string;
        return data;
    });
    // PATHS
    var paths = function (ps) {
        var p = paths.ps = paths.ps || {};
        if (p[ps]) {
            p[ps].sleep = 100;
        } else {
            p[ps] = {
                sleep: 100
            };
        }
        setTimeout(function () {
            for (var key in p) if (p[has](key) && key != ps) {
                p[key].sleep--;
                !p[key].sleep && delete p[key];
            }
        });
        return p[ps];
    };
    /*\
     * Raphael.findDotsAtSegment
     [ method ]
     **
     * Utility method
     **
     * Find dot coordinates on the given cubic bezier curve at the given t.
     > Parameters
     - p1x (number) x of the first point of the curve
     - p1y (number) y of the first point of the curve
     - c1x (number) x of the first anchor of the curve
     - c1y (number) y of the first anchor of the curve
     - c2x (number) x of the second anchor of the curve
     - c2y (number) y of the second anchor of the curve
     - p2x (number) x of the second point of the curve
     - p2y (number) y of the second point of the curve
     - t (number) position on the curve (0..1)
     = (object) point information in format:
     o {
     o     x: (number) x coordinate of the point
     o     y: (number) y coordinate of the point
     o     m: {
     o         x: (number) x coordinate of the left anchor
     o         y: (number) y coordinate of the left anchor
     o     }
     o     n: {
     o         x: (number) x coordinate of the right anchor
     o         y: (number) y coordinate of the right anchor
     o     }
     o     start: {
     o         x: (number) x coordinate of the start of the curve
     o         y: (number) y coordinate of the start of the curve
     o     }
     o     end: {
     o         x: (number) x coordinate of the end of the curve
     o         y: (number) y coordinate of the end of the curve
     o     }
     o     alpha: (number) angle of the curve derivative at the point
     o }
     \*/
    R.findDotsAtSegment = function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
        var t1 = 1 - t,
            t13 = pow(t1, 3),
            t12 = pow(t1, 2),
            t2 = t * t,
            t3 = t2 * t,
            x = t13 * p1x + t12 * 3 * t * c1x + t1 * 3 * t * t * c2x + t3 * p2x,
            y = t13 * p1y + t12 * 3 * t * c1y + t1 * 3 * t * t * c2y + t3 * p2y,
            mx = p1x + 2 * t * (c1x - p1x) + t2 * (c2x - 2 * c1x + p1x),
            my = p1y + 2 * t * (c1y - p1y) + t2 * (c2y - 2 * c1y + p1y),
            nx = c1x + 2 * t * (c2x - c1x) + t2 * (p2x - 2 * c2x + c1x),
            ny = c1y + 2 * t * (c2y - c1y) + t2 * (p2y - 2 * c2y + c1y),
            ax = t1 * p1x + t * c1x,
            ay = t1 * p1y + t * c1y,
            cx = t1 * c2x + t * p2x,
            cy = t1 * c2y + t * p2y,
            alpha = (90 - math.atan2(mx - nx, my - ny) * 180 / PI);
        (mx > nx || my < ny) && (alpha += 180);
        return {
            x: x,
            y: y,
            m: {x: mx, y: my},
            n: {x: nx, y: ny},
            start: {x: ax, y: ay},
            end: {x: cx, y: cy},
            alpha: alpha
        };
    };
    /*\
     * Raphael.bezierBBox
     [ method ]
     **
     * Utility method
     **
     * Return bounding box of a given cubic bezier curve
     > Parameters
     - p1x (number) x of the first point of the curve
     - p1y (number) y of the first point of the curve
     - c1x (number) x of the first anchor of the curve
     - c1y (number) y of the first anchor of the curve
     - c2x (number) x of the second anchor of the curve
     - c2y (number) y of the second anchor of the curve
     - p2x (number) x of the second point of the curve
     - p2y (number) y of the second point of the curve
     * or
     - bez (array) array of six points for bezier curve
     = (object) point information in format:
     o {
     o     min: {
     o         x: (number) x coordinate of the left point
     o         y: (number) y coordinate of the top point
     o     }
     o     max: {
     o         x: (number) x coordinate of the right point
     o         y: (number) y coordinate of the bottom point
     o     }
     o }
     \*/
    R.bezierBBox = function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y) {
        if (!R.is(p1x, "array")) {
            p1x = [p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y];
        }
        var bbox = curveDim.apply(null, p1x);
        return {
            x: bbox.min.x,
            y: bbox.min.y,
            x2: bbox.max.x,
            y2: bbox.max.y,
            width: bbox.max.x - bbox.min.x,
            height: bbox.max.y - bbox.min.y
        };
    };
    /*\
     * Raphael.isPointInsideBBox
     [ method ]
     **
     * Utility method
     **
     * Returns `true` if given point is inside bounding boxes.
     > Parameters
     - bbox (string) bounding box
     - x (string) x coordinate of the point
     - y (string) y coordinate of the point
     = (boolean) `true` if point inside
     \*/
    R.isPointInsideBBox = function (bbox, x, y) {
        return x >= bbox.x && x <= bbox.x2 && y >= bbox.y && y <= bbox.y2;
    };
    /*\
     * Raphael.isBBoxIntersect
     [ method ]
     **
     * Utility method
     **
     * Returns `true` if two bounding boxes intersect
     > Parameters
     - bbox1 (string) first bounding box
     - bbox2 (string) second bounding box
     = (boolean) `true` if they intersect
     \*/
    R.isBBoxIntersect = function (bbox1, bbox2) {
        var i = R.isPointInsideBBox;
        return i(bbox2, bbox1.x, bbox1.y)
            || i(bbox2, bbox1.x2, bbox1.y)
            || i(bbox2, bbox1.x, bbox1.y2)
            || i(bbox2, bbox1.x2, bbox1.y2)
            || i(bbox1, bbox2.x, bbox2.y)
            || i(bbox1, bbox2.x2, bbox2.y)
            || i(bbox1, bbox2.x, bbox2.y2)
            || i(bbox1, bbox2.x2, bbox2.y2)
            || (bbox1.x < bbox2.x2 && bbox1.x > bbox2.x || bbox2.x < bbox1.x2 && bbox2.x > bbox1.x)
            && (bbox1.y < bbox2.y2 && bbox1.y > bbox2.y || bbox2.y < bbox1.y2 && bbox2.y > bbox1.y);
    };
    function base3(t, p1, p2, p3, p4) {
        var t1 = -3 * p1 + 9 * p2 - 9 * p3 + 3 * p4,
            t2 = t * t1 + 6 * p1 - 12 * p2 + 6 * p3;
        return t * t2 - 3 * p1 + 3 * p2;
    }
    function bezlen(x1, y1, x2, y2, x3, y3, x4, y4, z) {
        if (z == null) {
            z = 1;
        }
        z = z > 1 ? 1 : z < 0 ? 0 : z;
        var z2 = z / 2,
            n = 12,
            Tvalues = [-0.1252,0.1252,-0.3678,0.3678,-0.5873,0.5873,-0.7699,0.7699,-0.9041,0.9041,-0.9816,0.9816],
            Cvalues = [0.2491,0.2491,0.2335,0.2335,0.2032,0.2032,0.1601,0.1601,0.1069,0.1069,0.0472,0.0472],
            sum = 0;
        for (var i = 0; i < n; i++) {
            var ct = z2 * Tvalues[i] + z2,
                xbase = base3(ct, x1, x2, x3, x4),
                ybase = base3(ct, y1, y2, y3, y4),
                comb = xbase * xbase + ybase * ybase;
            sum += Cvalues[i] * math.sqrt(comb);
        }
        return z2 * sum;
    }
    function getTatLen(x1, y1, x2, y2, x3, y3, x4, y4, ll) {
        if (ll < 0 || bezlen(x1, y1, x2, y2, x3, y3, x4, y4) < ll) {
            return;
        }
        var t = 1,
            step = t / 2,
            t2 = t - step,
            l,
            e = .01;
        l = bezlen(x1, y1, x2, y2, x3, y3, x4, y4, t2);
        while (abs(l - ll) > e) {
            step /= 2;
            t2 += (l < ll ? 1 : -1) * step;
            l = bezlen(x1, y1, x2, y2, x3, y3, x4, y4, t2);
        }
        return t2;
    }
    function intersect(x1, y1, x2, y2, x3, y3, x4, y4) {
        if (
            mmax(x1, x2) < mmin(x3, x4) ||
            mmin(x1, x2) > mmax(x3, x4) ||
            mmax(y1, y2) < mmin(y3, y4) ||
            mmin(y1, y2) > mmax(y3, y4)
        ) {
            return;
        }
        var nx = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4),
            ny = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4),
            denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

        if (!denominator) {
            return;
        }
        var px = nx / denominator,
            py = ny / denominator,
            px2 = +px.toFixed(2),
            py2 = +py.toFixed(2);
        if (
            px2 < +mmin(x1, x2).toFixed(2) ||
            px2 > +mmax(x1, x2).toFixed(2) ||
            px2 < +mmin(x3, x4).toFixed(2) ||
            px2 > +mmax(x3, x4).toFixed(2) ||
            py2 < +mmin(y1, y2).toFixed(2) ||
            py2 > +mmax(y1, y2).toFixed(2) ||
            py2 < +mmin(y3, y4).toFixed(2) ||
            py2 > +mmax(y3, y4).toFixed(2)
        ) {
            return;
        }
        return {x: px, y: py};
    }
    function inter(bez1, bez2) {
        return interHelper(bez1, bez2);
    }
    function interCount(bez1, bez2) {
        return interHelper(bez1, bez2, 1);
    }
    function interHelper(bez1, bez2, justCount) {
        var bbox1 = R.bezierBBox(bez1),
            bbox2 = R.bezierBBox(bez2);
        if (!R.isBBoxIntersect(bbox1, bbox2)) {
            return justCount ? 0 : [];
        }
        var l1 = bezlen.apply(0, bez1),
            l2 = bezlen.apply(0, bez2),
            n1 = ~~(l1 / 5),
            n2 = ~~(l2 / 5),
            dots1 = [],
            dots2 = [],
            xy = {},
            res = justCount ? 0 : [];
        for (var i = 0; i < n1 + 1; i++) {
            var p = R.findDotsAtSegment.apply(R, bez1.concat(i / n1));
            dots1.push({x: p.x, y: p.y, t: i / n1});
        }
        for (i = 0; i < n2 + 1; i++) {
            p = R.findDotsAtSegment.apply(R, bez2.concat(i / n2));
            dots2.push({x: p.x, y: p.y, t: i / n2});
        }
        for (i = 0; i < n1; i++) {
            for (var j = 0; j < n2; j++) {
                var di = dots1[i],
                    di1 = dots1[i + 1],
                    dj = dots2[j],
                    dj1 = dots2[j + 1],
                    ci = abs(di1.x - di.x) < .001 ? "y" : "x",
                    cj = abs(dj1.x - dj.x) < .001 ? "y" : "x",
                    is = intersect(di.x, di.y, di1.x, di1.y, dj.x, dj.y, dj1.x, dj1.y);
                if (is) {
                    if (xy[is.x.toFixed(4)] == is.y.toFixed(4)) {
                        continue;
                    }
                    xy[is.x.toFixed(4)] = is.y.toFixed(4);
                    var t1 = di.t + abs((is[ci] - di[ci]) / (di1[ci] - di[ci])) * (di1.t - di.t),
                        t2 = dj.t + abs((is[cj] - dj[cj]) / (dj1[cj] - dj[cj])) * (dj1.t - dj.t);
                    if (t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1) {
                        if (justCount) {
                            res++;
                        } else {
                            res.push({
                                x: is.x,
                                y: is.y,
                                t1: t1,
                                t2: t2
                            });
                        }
                    }
                }
            }
        }
        return res;
    }
    /*\
     * Raphael.pathIntersection
     [ method ]
     **
     * Utility method
     **
     * Finds intersections of two paths
     > Parameters
     - path1 (string) path string
     - path2 (string) path string
     = (array) dots of intersection
     o [
     o     {
     o         x: (number) x coordinate of the point
     o         y: (number) y coordinate of the point
     o         t1: (number) t value for segment of path1
     o         t2: (number) t value for segment of path2
     o         segment1: (number) order number for segment of path1
     o         segment2: (number) order number for segment of path2
     o         bez1: (array) eight coordinates representing beziér curve for the segment of path1
     o         bez2: (array) eight coordinates representing beziér curve for the segment of path2
     o     }
     o ]
     \*/
    R.pathIntersection = function (path1, path2) {
        return interPathHelper(path1, path2);
    };
    R.pathIntersectionNumber = function (path1, path2) {
        return interPathHelper(path1, path2, 1);
    };
    function interPathHelper(path1, path2, justCount) {
        path1 = R._path2curve(path1);
        path2 = R._path2curve(path2);
        var x1, y1, x2, y2, x1m, y1m, x2m, y2m, bez1, bez2,
            res = justCount ? 0 : [];
        for (var i = 0, ii = path1.length; i < ii; i++) {
            var pi = path1[i];
            if (pi[0] == "M") {
                x1 = x1m = pi[1];
                y1 = y1m = pi[2];
            } else {
                if (pi[0] == "C") {
                    bez1 = [x1, y1].concat(pi.slice(1));
                    x1 = bez1[6];
                    y1 = bez1[7];
                } else {
                    bez1 = [x1, y1, x1, y1, x1m, y1m, x1m, y1m];
                    x1 = x1m;
                    y1 = y1m;
                }
                for (var j = 0, jj = path2.length; j < jj; j++) {
                    var pj = path2[j];
                    if (pj[0] == "M") {
                        x2 = x2m = pj[1];
                        y2 = y2m = pj[2];
                    } else {
                        if (pj[0] == "C") {
                            bez2 = [x2, y2].concat(pj.slice(1));
                            x2 = bez2[6];
                            y2 = bez2[7];
                        } else {
                            bez2 = [x2, y2, x2, y2, x2m, y2m, x2m, y2m];
                            x2 = x2m;
                            y2 = y2m;
                        }
                        var intr = interHelper(bez1, bez2, justCount);
                        if (justCount) {
                            res += intr;
                        } else {
                            for (var k = 0, kk = intr.length; k < kk; k++) {
                                intr[k].segment1 = i;
                                intr[k].segment2 = j;
                                intr[k].bez1 = bez1;
                                intr[k].bez2 = bez2;
                            }
                            res = res.concat(intr);
                        }
                    }
                }
            }
        }
        return res;
    }
    /*\
     * Raphael.isPointInsidePath
     [ method ]
     **
     * Utility method
     **
     * Returns `true` if given point is inside a given closed path.
     > Parameters
     - path (string) path string
     - x (number) x of the point
     - y (number) y of the point
     = (boolean) true, if point is inside the path
     \*/
    R.isPointInsidePath = function (path, x, y) {
        var bbox = R.pathBBox(path);
        return R.isPointInsideBBox(bbox, x, y) &&
            interPathHelper(path, [["M", x, y], ["H", bbox.x2 + 10]], 1) % 2 == 1;
    };
    R._removedFactory = function (methodname) {
        return function () {
            eve("raphael.log", null, "Rapha\xebl: you are calling to method \u201c" + methodname + "\u201d of removed object", methodname);
        };
    };
    /*\
     * Raphael.pathBBox
     [ method ]
     **
     * Utility method
     **
     * Return bounding box of a given path
     > Parameters
     - path (string) path string
     = (object) bounding box
     o {
     o     x: (number) x coordinate of the left top point of the box
     o     y: (number) y coordinate of the left top point of the box
     o     x2: (number) x coordinate of the right bottom point of the box
     o     y2: (number) y coordinate of the right bottom point of the box
     o     width: (number) width of the box
     o     height: (number) height of the box
     o     cx: (number) x coordinate of the center of the box
     o     cy: (number) y coordinate of the center of the box
     o }
     \*/
    var pathDimensions = R.pathBBox = function (path) {
            var pth = paths(path);
            if (pth.bbox) {
                return clone(pth.bbox);
            }
            if (!path) {
                return {x: 0, y: 0, width: 0, height: 0, x2: 0, y2: 0};
            }
            path = path2curve(path);
            var x = 0,
                y = 0,
                X = [],
                Y = [],
                p;
            for (var i = 0, ii = path.length; i < ii; i++) {
                p = path[i];
                if (p[0] == "M") {
                    x = p[1];
                    y = p[2];
                    X.push(x);
                    Y.push(y);
                } else {
                    var dim = curveDim(x, y, p[1], p[2], p[3], p[4], p[5], p[6]);
                    X = X[concat](dim.min.x, dim.max.x);
                    Y = Y[concat](dim.min.y, dim.max.y);
                    x = p[5];
                    y = p[6];
                }
            }
            var xmin = mmin[apply](0, X),
                ymin = mmin[apply](0, Y),
                xmax = mmax[apply](0, X),
                ymax = mmax[apply](0, Y),
                width = xmax - xmin,
                height = ymax - ymin,
                bb = {
                    x: xmin,
                    y: ymin,
                    x2: xmax,
                    y2: ymax,
                    width: width,
                    height: height,
                    cx: xmin + width / 2,
                    cy: ymin + height / 2
                };
            pth.bbox = clone(bb);
            return bb;
        },
        pathClone = function (pathArray) {
            var res = clone(pathArray);
            res.toString = R._path2string;
            return res;
        },
        pathToRelative = R._pathToRelative = function (pathArray) {
            var pth = paths(pathArray);
            if (pth.rel) {
                return pathClone(pth.rel);
            }
            if (!R.is(pathArray, array) || !R.is(pathArray && pathArray[0], array)) { // rough assumption
                pathArray = R.parsePathString(pathArray);
            }
            var res = [],
                x = 0,
                y = 0,
                mx = 0,
                my = 0,
                start = 0;
            if (pathArray[0][0] == "M") {
                x = pathArray[0][1];
                y = pathArray[0][2];
                mx = x;
                my = y;
                start++;
                res.push(["M", x, y]);
            }
            for (var i = start, ii = pathArray.length; i < ii; i++) {
                var r = res[i] = [],
                    pa = pathArray[i];
                if (pa[0] != lowerCase.call(pa[0])) {
                    r[0] = lowerCase.call(pa[0]);
                    switch (r[0]) {
                        case "a":
                            r[1] = pa[1];
                            r[2] = pa[2];
                            r[3] = pa[3];
                            r[4] = pa[4];
                            r[5] = pa[5];
                            r[6] = +(pa[6] - x).toFixed(3);
                            r[7] = +(pa[7] - y).toFixed(3);
                            break;
                        case "v":
                            r[1] = +(pa[1] - y).toFixed(3);
                            break;
                        case "m":
                            mx = pa[1];
                            my = pa[2];
                        default:
                            for (var j = 1, jj = pa.length; j < jj; j++) {
                                r[j] = +(pa[j] - ((j % 2) ? x : y)).toFixed(3);
                            }
                    }
                } else {
                    r = res[i] = [];
                    if (pa[0] == "m") {
                        mx = pa[1] + x;
                        my = pa[2] + y;
                    }
                    for (var k = 0, kk = pa.length; k < kk; k++) {
                        res[i][k] = pa[k];
                    }
                }
                var len = res[i].length;
                switch (res[i][0]) {
                    case "z":
                        x = mx;
                        y = my;
                        break;
                    case "h":
                        x += +res[i][len - 1];
                        break;
                    case "v":
                        y += +res[i][len - 1];
                        break;
                    default:
                        x += +res[i][len - 2];
                        y += +res[i][len - 1];
                }
            }
            res.toString = R._path2string;
            pth.rel = pathClone(res);
            return res;
        },
        pathToAbsolute = R._pathToAbsolute = function (pathArray) {
            var pth = paths(pathArray);
            if (pth.abs) {
                return pathClone(pth.abs);
            }
            if (!R.is(pathArray, array) || !R.is(pathArray && pathArray[0], array)) { // rough assumption
                pathArray = R.parsePathString(pathArray);
            }
            if (!pathArray || !pathArray.length) {
                return [["M", 0, 0]];
            }
            var res = [],
                x = 0,
                y = 0,
                mx = 0,
                my = 0,
                start = 0;
            if (pathArray[0][0] == "M") {
                x = +pathArray[0][1];
                y = +pathArray[0][2];
                mx = x;
                my = y;
                start++;
                res[0] = ["M", x, y];
            }
            var crz = pathArray.length == 3 && pathArray[0][0] == "M" && pathArray[1][0].toUpperCase() == "R" && pathArray[2][0].toUpperCase() == "Z";
            for (var r, pa, i = start, ii = pathArray.length; i < ii; i++) {
                res.push(r = []);
                pa = pathArray[i];
                if (pa[0] != upperCase.call(pa[0])) {
                    r[0] = upperCase.call(pa[0]);
                    switch (r[0]) {
                        case "A":
                            r[1] = pa[1];
                            r[2] = pa[2];
                            r[3] = pa[3];
                            r[4] = pa[4];
                            r[5] = pa[5];
                            r[6] = +(pa[6] + x);
                            r[7] = +(pa[7] + y);
                            break;
                        case "V":
                            r[1] = +pa[1] + y;
                            break;
                        case "H":
                            r[1] = +pa[1] + x;
                            break;
                        case "R":
                            var dots = [x, y][concat](pa.slice(1));
                            for (var j = 2, jj = dots.length; j < jj; j++) {
                                dots[j] = +dots[j] + x;
                                dots[++j] = +dots[j] + y;
                            }
                            res.pop();
                            res = res[concat](catmullRom2bezier(dots, crz));
                            break;
                        case "M":
                            mx = +pa[1] + x;
                            my = +pa[2] + y;
                        default:
                            for (j = 1, jj = pa.length; j < jj; j++) {
                                r[j] = +pa[j] + ((j % 2) ? x : y);
                            }
                    }
                } else if (pa[0] == "R") {
                    dots = [x, y][concat](pa.slice(1));
                    res.pop();
                    res = res[concat](catmullRom2bezier(dots, crz));
                    r = ["R"][concat](pa.slice(-2));
                } else {
                    for (var k = 0, kk = pa.length; k < kk; k++) {
                        r[k] = pa[k];
                    }
                }
                switch (r[0]) {
                    case "Z":
                        x = mx;
                        y = my;
                        break;
                    case "H":
                        x = r[1];
                        break;
                    case "V":
                        y = r[1];
                        break;
                    case "M":
                        mx = r[r.length - 2];
                        my = r[r.length - 1];
                    default:
                        x = r[r.length - 2];
                        y = r[r.length - 1];
                }
            }
            res.toString = R._path2string;
            pth.abs = pathClone(res);
            return res;
        },
        l2c = function (x1, y1, x2, y2) {
            return [x1, y1, x2, y2, x2, y2];
        },
        q2c = function (x1, y1, ax, ay, x2, y2) {
            var _13 = 1 / 3,
                _23 = 2 / 3;
            return [
                _13 * x1 + _23 * ax,
                _13 * y1 + _23 * ay,
                _13 * x2 + _23 * ax,
                _13 * y2 + _23 * ay,
                x2,
                y2
            ];
        },
        a2c = function (x1, y1, rx, ry, angle, large_arc_flag, sweep_flag, x2, y2, recursive) {
            // for more information of where this math came from visit:
            // http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
            var _120 = PI * 120 / 180,
                rad = PI / 180 * (+angle || 0),
                res = [],
                xy,
                rotate = cacher(function (x, y, rad) {
                    var X = x * math.cos(rad) - y * math.sin(rad),
                        Y = x * math.sin(rad) + y * math.cos(rad);
                    return {x: X, y: Y};
                });
            if (!recursive) {
                xy = rotate(x1, y1, -rad);
                x1 = xy.x;
                y1 = xy.y;
                xy = rotate(x2, y2, -rad);
                x2 = xy.x;
                y2 = xy.y;
                var cos = math.cos(PI / 180 * angle),
                    sin = math.sin(PI / 180 * angle),
                    x = (x1 - x2) / 2,
                    y = (y1 - y2) / 2;
                var h = (x * x) / (rx * rx) + (y * y) / (ry * ry);
                if (h > 1) {
                    h = math.sqrt(h);
                    rx = h * rx;
                    ry = h * ry;
                }
                var rx2 = rx * rx,
                    ry2 = ry * ry,
                    k = (large_arc_flag == sweep_flag ? -1 : 1) *
                        math.sqrt(abs((rx2 * ry2 - rx2 * y * y - ry2 * x * x) / (rx2 * y * y + ry2 * x * x))),
                    cx = k * rx * y / ry + (x1 + x2) / 2,
                    cy = k * -ry * x / rx + (y1 + y2) / 2,
                    f1 = math.asin(((y1 - cy) / ry).toFixed(9)),
                    f2 = math.asin(((y2 - cy) / ry).toFixed(9));

                f1 = x1 < cx ? PI - f1 : f1;
                f2 = x2 < cx ? PI - f2 : f2;
                f1 < 0 && (f1 = PI * 2 + f1);
                f2 < 0 && (f2 = PI * 2 + f2);
                if (sweep_flag && f1 > f2) {
                    f1 = f1 - PI * 2;
                }
                if (!sweep_flag && f2 > f1) {
                    f2 = f2 - PI * 2;
                }
            } else {
                f1 = recursive[0];
                f2 = recursive[1];
                cx = recursive[2];
                cy = recursive[3];
            }
            var df = f2 - f1;
            if (abs(df) > _120) {
                var f2old = f2,
                    x2old = x2,
                    y2old = y2;
                f2 = f1 + _120 * (sweep_flag && f2 > f1 ? 1 : -1);
                x2 = cx + rx * math.cos(f2);
                y2 = cy + ry * math.sin(f2);
                res = a2c(x2, y2, rx, ry, angle, 0, sweep_flag, x2old, y2old, [f2, f2old, cx, cy]);
            }
            df = f2 - f1;
            var c1 = math.cos(f1),
                s1 = math.sin(f1),
                c2 = math.cos(f2),
                s2 = math.sin(f2),
                t = math.tan(df / 4),
                hx = 4 / 3 * rx * t,
                hy = 4 / 3 * ry * t,
                m1 = [x1, y1],
                m2 = [x1 + hx * s1, y1 - hy * c1],
                m3 = [x2 + hx * s2, y2 - hy * c2],
                m4 = [x2, y2];
            m2[0] = 2 * m1[0] - m2[0];
            m2[1] = 2 * m1[1] - m2[1];
            if (recursive) {
                return [m2, m3, m4][concat](res);
            } else {
                res = [m2, m3, m4][concat](res).join()[split](",");
                var newres = [];
                for (var i = 0, ii = res.length; i < ii; i++) {
                    newres[i] = i % 2 ? rotate(res[i - 1], res[i], rad).y : rotate(res[i], res[i + 1], rad).x;
                }
                return newres;
            }
        },
        findDotAtSegment = function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
            var t1 = 1 - t;
            return {
                x: pow(t1, 3) * p1x + pow(t1, 2) * 3 * t * c1x + t1 * 3 * t * t * c2x + pow(t, 3) * p2x,
                y: pow(t1, 3) * p1y + pow(t1, 2) * 3 * t * c1y + t1 * 3 * t * t * c2y + pow(t, 3) * p2y
            };
        },
        curveDim = cacher(function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y) {
            var a = (c2x - 2 * c1x + p1x) - (p2x - 2 * c2x + c1x),
                b = 2 * (c1x - p1x) - 2 * (c2x - c1x),
                c = p1x - c1x,
                t1 = (-b + math.sqrt(b * b - 4 * a * c)) / 2 / a,
                t2 = (-b - math.sqrt(b * b - 4 * a * c)) / 2 / a,
                y = [p1y, p2y],
                x = [p1x, p2x],
                dot;
            abs(t1) > "1e12" && (t1 = .5);
            abs(t2) > "1e12" && (t2 = .5);
            if (t1 > 0 && t1 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t1);
                x.push(dot.x);
                y.push(dot.y);
            }
            if (t2 > 0 && t2 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t2);
                x.push(dot.x);
                y.push(dot.y);
            }
            a = (c2y - 2 * c1y + p1y) - (p2y - 2 * c2y + c1y);
            b = 2 * (c1y - p1y) - 2 * (c2y - c1y);
            c = p1y - c1y;
            t1 = (-b + math.sqrt(b * b - 4 * a * c)) / 2 / a;
            t2 = (-b - math.sqrt(b * b - 4 * a * c)) / 2 / a;
            abs(t1) > "1e12" && (t1 = .5);
            abs(t2) > "1e12" && (t2 = .5);
            if (t1 > 0 && t1 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t1);
                x.push(dot.x);
                y.push(dot.y);
            }
            if (t2 > 0 && t2 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t2);
                x.push(dot.x);
                y.push(dot.y);
            }
            return {
                min: {x: mmin[apply](0, x), y: mmin[apply](0, y)},
                max: {x: mmax[apply](0, x), y: mmax[apply](0, y)}
            };
        }),
        path2curve = R._path2curve = cacher(function (path, path2) {
            var pth = !path2 && paths(path);
            if (!path2 && pth.curve) {
                return pathClone(pth.curve);
            }
            var p = pathToAbsolute(path),
                p2 = path2 && pathToAbsolute(path2),
                attrs = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
                attrs2 = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
                processPath = function (path, d) {
                    var nx, ny;
                    if (!path) {
                        return ["C", d.x, d.y, d.x, d.y, d.x, d.y];
                    }
                    !(path[0] in {T:1, Q:1}) && (d.qx = d.qy = null);
                    switch (path[0]) {
                        case "M":
                            d.X = path[1];
                            d.Y = path[2];
                            break;
                        case "A":
                            path = ["C"][concat](a2c[apply](0, [d.x, d.y][concat](path.slice(1))));
                            break;
                        case "S":
                            nx = d.x + (d.x - (d.bx || d.x));
                            ny = d.y + (d.y - (d.by || d.y));
                            path = ["C", nx, ny][concat](path.slice(1));
                            break;
                        case "T":
                            d.qx = d.x + (d.x - (d.qx || d.x));
                            d.qy = d.y + (d.y - (d.qy || d.y));
                            path = ["C"][concat](q2c(d.x, d.y, d.qx, d.qy, path[1], path[2]));
                            break;
                        case "Q":
                            d.qx = path[1];
                            d.qy = path[2];
                            path = ["C"][concat](q2c(d.x, d.y, path[1], path[2], path[3], path[4]));
                            break;
                        case "L":
                            path = ["C"][concat](l2c(d.x, d.y, path[1], path[2]));
                            break;
                        case "H":
                            path = ["C"][concat](l2c(d.x, d.y, path[1], d.y));
                            break;
                        case "V":
                            path = ["C"][concat](l2c(d.x, d.y, d.x, path[1]));
                            break;
                        case "Z":
                            path = ["C"][concat](l2c(d.x, d.y, d.X, d.Y));
                            break;
                    }
                    return path;
                },
                fixArc = function (pp, i) {
                    if (pp[i].length > 7) {
                        pp[i].shift();
                        var pi = pp[i];
                        while (pi.length) {
                            pp.splice(i++, 0, ["C"][concat](pi.splice(0, 6)));
                        }
                        pp.splice(i, 1);
                        ii = mmax(p.length, p2 && p2.length || 0);
                    }
                },
                fixM = function (path1, path2, a1, a2, i) {
                    if (path1 && path2 && path1[i][0] == "M" && path2[i][0] != "M") {
                        path2.splice(i, 0, ["M", a2.x, a2.y]);
                        a1.bx = 0;
                        a1.by = 0;
                        a1.x = path1[i][1];
                        a1.y = path1[i][2];
                        ii = mmax(p.length, p2 && p2.length || 0);
                    }
                };
            for (var i = 0, ii = mmax(p.length, p2 && p2.length || 0); i < ii; i++) {
                p[i] = processPath(p[i], attrs);
                fixArc(p, i);
                p2 && (p2[i] = processPath(p2[i], attrs2));
                p2 && fixArc(p2, i);
                fixM(p, p2, attrs, attrs2, i);
                fixM(p2, p, attrs2, attrs, i);
                var seg = p[i],
                    seg2 = p2 && p2[i],
                    seglen = seg.length,
                    seg2len = p2 && seg2.length;
                attrs.x = seg[seglen - 2];
                attrs.y = seg[seglen - 1];
                attrs.bx = toFloat(seg[seglen - 4]) || attrs.x;
                attrs.by = toFloat(seg[seglen - 3]) || attrs.y;
                attrs2.bx = p2 && (toFloat(seg2[seg2len - 4]) || attrs2.x);
                attrs2.by = p2 && (toFloat(seg2[seg2len - 3]) || attrs2.y);
                attrs2.x = p2 && seg2[seg2len - 2];
                attrs2.y = p2 && seg2[seg2len - 1];
            }
            if (!p2) {
                pth.curve = pathClone(p);
            }
            return p2 ? [p, p2] : p;
        }, null, pathClone),
        parseDots = R._parseDots = cacher(function (gradient) {
            var dots = [];
            for (var i = 0, ii = gradient.length; i < ii; i++) {
                var dot = {},
                    par = gradient[i].match(/^([^:]*):?([\d\.]*)/);
                dot.color = R.getRGB(par[1]);
                if (dot.color.error) {
                    return null;
                }
                dot.color = dot.color.hex;
                par[2] && (dot.offset = par[2] + "%");
                dots.push(dot);
            }
            for (i = 1, ii = dots.length - 1; i < ii; i++) {
                if (!dots[i].offset) {
                    var start = toFloat(dots[i - 1].offset || 0),
                        end = 0;
                    for (var j = i + 1; j < ii; j++) {
                        if (dots[j].offset) {
                            end = dots[j].offset;
                            break;
                        }
                    }
                    if (!end) {
                        end = 100;
                        j = ii;
                    }
                    end = toFloat(end);
                    var d = (end - start) / (j - i + 1);
                    for (; i < j; i++) {
                        start += d;
                        dots[i].offset = start + "%";
                    }
                }
            }
            return dots;
        }),
        tear = R._tear = function (el, paper) {
            el == paper.top && (paper.top = el.prev);
            el == paper.bottom && (paper.bottom = el.next);
            el.next && (el.next.prev = el.prev);
            el.prev && (el.prev.next = el.next);
        },
        tofront = R._tofront = function (el, paper) {
            if (paper.top === el) {
                return;
            }
            tear(el, paper);
            el.next = null;
            el.prev = paper.top;
            paper.top.next = el;
            paper.top = el;
        },
        toback = R._toback = function (el, paper) {
            if (paper.bottom === el) {
                return;
            }
            tear(el, paper);
            el.next = paper.bottom;
            el.prev = null;
            paper.bottom.prev = el;
            paper.bottom = el;
        },
        insertafter = R._insertafter = function (el, el2, paper) {
            tear(el, paper);
            el2 == paper.top && (paper.top = el);
            el2.next && (el2.next.prev = el);
            el.next = el2.next;
            el.prev = el2;
            el2.next = el;
        },
        insertbefore = R._insertbefore = function (el, el2, paper) {
            tear(el, paper);
            el2 == paper.bottom && (paper.bottom = el);
            el2.prev && (el2.prev.next = el);
            el.prev = el2.prev;
            el2.prev = el;
            el.next = el2;
        },
    /*\
     * Raphael.toMatrix
     [ method ]
     **
     * Utility method
     **
     * Returns matrix of transformations applied to a given path
     > Parameters
     - path (string) path string
     - transform (string|array) transformation string
     = (object) @Matrix
     \*/
        toMatrix = R.toMatrix = function (path, transform) {
            var bb = pathDimensions(path),
                el = {
                    _: {
                        transform: E
                    },
                    getBBox: function () {
                        return bb;
                    }
                };
            extractTransform(el, transform);
            return el.matrix;
        },
    /*\
     * Raphael.transformPath
     [ method ]
     **
     * Utility method
     **
     * Returns path transformed by a given transformation
     > Parameters
     - path (string) path string
     - transform (string|array) transformation string
     = (string) path
     \*/
        transformPath = R.transformPath = function (path, transform) {
            return mapPath(path, toMatrix(path, transform));
        },
        extractTransform = R._extractTransform = function (el, tstr) {
            if (tstr == null) {
                return el._.transform;
            }
            tstr = Str(tstr).replace(/\.{3}|\u2026/g, el._.transform || E);
            var tdata = R.parseTransformString(tstr),
                deg = 0,
                dx = 0,
                dy = 0,
                sx = 1,
                sy = 1,
                _ = el._,
                m = new Matrix;
            _.transform = tdata || [];
            if (tdata) {
                for (var i = 0, ii = tdata.length; i < ii; i++) {
                    var t = tdata[i],
                        tlen = t.length,
                        command = Str(t[0]).toLowerCase(),
                        absolute = t[0] != command,
                        inver = absolute ? m.invert() : 0,
                        x1,
                        y1,
                        x2,
                        y2,
                        bb;
                    if (command == "t" && tlen == 3) {
                        if (absolute) {
                            x1 = inver.x(0, 0);
                            y1 = inver.y(0, 0);
                            x2 = inver.x(t[1], t[2]);
                            y2 = inver.y(t[1], t[2]);
                            m.translate(x2 - x1, y2 - y1);
                        } else {
                            m.translate(t[1], t[2]);
                        }
                    } else if (command == "r") {
                        if (tlen == 2) {
                            bb = bb || el.getBBox(1);
                            m.rotate(t[1], bb.x + bb.width / 2, bb.y + bb.height / 2);
                            deg += t[1];
                        } else if (tlen == 4) {
                            if (absolute) {
                                x2 = inver.x(t[2], t[3]);
                                y2 = inver.y(t[2], t[3]);
                                m.rotate(t[1], x2, y2);
                            } else {
                                m.rotate(t[1], t[2], t[3]);
                            }
                            deg += t[1];
                        }
                    } else if (command == "s") {
                        if (tlen == 2 || tlen == 3) {
                            bb = bb || el.getBBox(1);
                            m.scale(t[1], t[tlen - 1], bb.x + bb.width / 2, bb.y + bb.height / 2);
                            sx *= t[1];
                            sy *= t[tlen - 1];
                        } else if (tlen == 5) {
                            if (absolute) {
                                x2 = inver.x(t[3], t[4]);
                                y2 = inver.y(t[3], t[4]);
                                m.scale(t[1], t[2], x2, y2);
                            } else {
                                m.scale(t[1], t[2], t[3], t[4]);
                            }
                            sx *= t[1];
                            sy *= t[2];
                        }
                    } else if (command == "m" && tlen == 7) {
                        m.add(t[1], t[2], t[3], t[4], t[5], t[6]);
                    }
                    _.dirtyT = 1;
                    el.matrix = m;
                }
            }

            /*\
             * Element.matrix
             [ property (object) ]
             **
             * Keeps @Matrix object, which represents element transformation
             \*/
            el.matrix = m;

            _.sx = sx;
            _.sy = sy;
            _.deg = deg;
            _.dx = dx = m.e;
            _.dy = dy = m.f;

            if (sx == 1 && sy == 1 && !deg && _.bbox) {
                _.bbox.x += +dx;
                _.bbox.y += +dy;
            } else {
                _.dirtyT = 1;
            }
        },
        getEmpty = function (item) {
            var l = item[0];
            switch (l.toLowerCase()) {
                case "t": return [l, 0, 0];
                case "m": return [l, 1, 0, 0, 1, 0, 0];
                case "r": if (item.length == 4) {
                    return [l, 0, item[2], item[3]];
                } else {
                    return [l, 0];
                }
                case "s": if (item.length == 5) {
                    return [l, 1, 1, item[3], item[4]];
                } else if (item.length == 3) {
                    return [l, 1, 1];
                } else {
                    return [l, 1];
                }
            }
        },
        equaliseTransform = R._equaliseTransform = function (t1, t2) {
            t2 = Str(t2).replace(/\.{3}|\u2026/g, t1);
            t1 = R.parseTransformString(t1) || [];
            t2 = R.parseTransformString(t2) || [];
            var maxlength = mmax(t1.length, t2.length),
                from = [],
                to = [],
                i = 0, j, jj,
                tt1, tt2;
            for (; i < maxlength; i++) {
                tt1 = t1[i] || getEmpty(t2[i]);
                tt2 = t2[i] || getEmpty(tt1);
                if ((tt1[0] != tt2[0]) ||
                    (tt1[0].toLowerCase() == "r" && (tt1[2] != tt2[2] || tt1[3] != tt2[3])) ||
                    (tt1[0].toLowerCase() == "s" && (tt1[3] != tt2[3] || tt1[4] != tt2[4]))
                ) {
                    return;
                }
                from[i] = [];
                to[i] = [];
                for (j = 0, jj = mmax(tt1.length, tt2.length); j < jj; j++) {
                    j in tt1 && (from[i][j] = tt1[j]);
                    j in tt2 && (to[i][j] = tt2[j]);
                }
            }
            return {
                from: from,
                to: to
            };
        };
    R._getContainer = function (x, y, w, h) {
        var container;
        container = h == null && !R.is(x, "object") ? g.doc.getElementById(x) : x;
        if (container == null) {
            return;
        }
        if (container.tagName) {
            if (y == null) {
                return {
                    container: container,
                    width: container.style.pixelWidth || container.offsetWidth,
                    height: container.style.pixelHeight || container.offsetHeight
                };
            } else {
                return {
                    container: container,
                    width: y,
                    height: w
                };
            }
        }
        return {
            container: 1,
            x: x,
            y: y,
            width: w,
            height: h
        };
    };
    /*\
     * Raphael.pathToRelative
     [ method ]
     **
     * Utility method
     **
     * Converts path to relative form
     > Parameters
     - pathString (string|array) path string or array of segments
     = (array) array of segments.
     \*/
    R.pathToRelative = pathToRelative;
    R._engine = {};
    /*\
     * Raphael.path2curve
     [ method ]
     **
     * Utility method
     **
     * Converts path to a new path where all segments are cubic bezier curves.
     > Parameters
     - pathString (string|array) path string or array of segments
     = (array) array of segments.
     \*/
    R.path2curve = path2curve;
    /*\
     * Raphael.matrix
     [ method ]
     **
     * Utility method
     **
     * Returns matrix based on given parameters.
     > Parameters
     - a (number)
     - b (number)
     - c (number)
     - d (number)
     - e (number)
     - f (number)
     = (object) @Matrix
     \*/
    R.matrix = function (a, b, c, d, e, f) {
        return new Matrix(a, b, c, d, e, f);
    };
    function Matrix(a, b, c, d, e, f) {
        if (a != null) {
            this.a = +a;
            this.b = +b;
            this.c = +c;
            this.d = +d;
            this.e = +e;
            this.f = +f;
        } else {
            this.a = 1;
            this.b = 0;
            this.c = 0;
            this.d = 1;
            this.e = 0;
            this.f = 0;
        }
    }
    (function (matrixproto) {
        /*\
         * Matrix.add
         [ method ]
         **
         * Adds given matrix to existing one.
         > Parameters
         - a (number)
         - b (number)
         - c (number)
         - d (number)
         - e (number)
         - f (number)
         or
         - matrix (object) @Matrix
         \*/
        matrixproto.add = function (a, b, c, d, e, f) {
            var out = [[], [], []],
                m = [[this.a, this.c, this.e], [this.b, this.d, this.f], [0, 0, 1]],
                matrix = [[a, c, e], [b, d, f], [0, 0, 1]],
                x, y, z, res;

            if (a && a instanceof Matrix) {
                matrix = [[a.a, a.c, a.e], [a.b, a.d, a.f], [0, 0, 1]];
            }

            for (x = 0; x < 3; x++) {
                for (y = 0; y < 3; y++) {
                    res = 0;
                    for (z = 0; z < 3; z++) {
                        res += m[x][z] * matrix[z][y];
                    }
                    out[x][y] = res;
                }
            }
            this.a = out[0][0];
            this.b = out[1][0];
            this.c = out[0][1];
            this.d = out[1][1];
            this.e = out[0][2];
            this.f = out[1][2];
        };
        /*\
         * Matrix.invert
         [ method ]
         **
         * Returns inverted version of the matrix
         = (object) @Matrix
         \*/
        matrixproto.invert = function () {
            var me = this,
                x = me.a * me.d - me.b * me.c;
            return new Matrix(me.d / x, -me.b / x, -me.c / x, me.a / x, (me.c * me.f - me.d * me.e) / x, (me.b * me.e - me.a * me.f) / x);
        };
        /*\
         * Matrix.clone
         [ method ]
         **
         * Returns copy of the matrix
         = (object) @Matrix
         \*/
        matrixproto.clone = function () {
            return new Matrix(this.a, this.b, this.c, this.d, this.e, this.f);
        };
        /*\
         * Matrix.translate
         [ method ]
         **
         * Translate the matrix
         > Parameters
         - x (number)
         - y (number)
         \*/
        matrixproto.translate = function (x, y) {
            this.add(1, 0, 0, 1, x, y);
        };
        /*\
         * Matrix.scale
         [ method ]
         **
         * Scales the matrix
         > Parameters
         - x (number)
         - y (number) #optional
         - cx (number) #optional
         - cy (number) #optional
         \*/
        matrixproto.scale = function (x, y, cx, cy) {
            y == null && (y = x);
            (cx || cy) && this.add(1, 0, 0, 1, cx, cy);
            this.add(x, 0, 0, y, 0, 0);
            (cx || cy) && this.add(1, 0, 0, 1, -cx, -cy);
        };
        /*\
         * Matrix.rotate
         [ method ]
         **
         * Rotates the matrix
         > Parameters
         - a (number)
         - x (number)
         - y (number)
         \*/
        matrixproto.rotate = function (a, x, y) {
            a = R.rad(a);
            x = x || 0;
            y = y || 0;
            var cos = +math.cos(a).toFixed(9),
                sin = +math.sin(a).toFixed(9);
            this.add(cos, sin, -sin, cos, x, y);
            this.add(1, 0, 0, 1, -x, -y);
        };
        /*\
         * Matrix.x
         [ method ]
         **
         * Return x coordinate for given point after transformation described by the matrix. See also @Matrix.y
         > Parameters
         - x (number)
         - y (number)
         = (number) x
         \*/
        matrixproto.x = function (x, y) {
            return x * this.a + y * this.c + this.e;
        };
        /*\
         * Matrix.y
         [ method ]
         **
         * Return y coordinate for given point after transformation described by the matrix. See also @Matrix.x
         > Parameters
         - x (number)
         - y (number)
         = (number) y
         \*/
        matrixproto.y = function (x, y) {
            return x * this.b + y * this.d + this.f;
        };
        matrixproto.get = function (i) {
            return +this[Str.fromCharCode(97 + i)].toFixed(4);
        };
        matrixproto.toString = function () {
            return R.svg ?
            "matrix(" + [this.get(0), this.get(1), this.get(2), this.get(3), this.get(4), this.get(5)].join() + ")" :
                [this.get(0), this.get(2), this.get(1), this.get(3), 0, 0].join();
        };
        matrixproto.toFilter = function () {
            return "progid:DXImageTransform.Microsoft.Matrix(M11=" + this.get(0) +
                ", M12=" + this.get(2) + ", M21=" + this.get(1) + ", M22=" + this.get(3) +
                ", Dx=" + this.get(4) + ", Dy=" + this.get(5) + ", sizingmethod='auto expand')";
        };
        matrixproto.offset = function () {
            return [this.e.toFixed(4), this.f.toFixed(4)];
        };
        function norm(a) {
            return a[0] * a[0] + a[1] * a[1];
        }
        function normalize(a) {
            var mag = math.sqrt(norm(a));
            a[0] && (a[0] /= mag);
            a[1] && (a[1] /= mag);
        }
        /*\
         * Matrix.split
         [ method ]
         **
         * Splits matrix into primitive transformations
         = (object) in format:
         o dx (number) translation by x
         o dy (number) translation by y
         o scalex (number) scale by x
         o scaley (number) scale by y
         o shear (number) shear
         o rotate (number) rotation in deg
         o isSimple (boolean) could it be represented via simple transformations
         \*/
        matrixproto.split = function () {
            var out = {};
            // translation
            out.dx = this.e;
            out.dy = this.f;

            // scale and shear
            var row = [[this.a, this.c], [this.b, this.d]];
            out.scalex = math.sqrt(norm(row[0]));
            normalize(row[0]);

            out.shear = row[0][0] * row[1][0] + row[0][1] * row[1][1];
            row[1] = [row[1][0] - row[0][0] * out.shear, row[1][1] - row[0][1] * out.shear];

            out.scaley = math.sqrt(norm(row[1]));
            normalize(row[1]);
            out.shear /= out.scaley;

            // rotation
            var sin = -row[0][1],
                cos = row[1][1];
            if (cos < 0) {
                out.rotate = R.deg(math.acos(cos));
                if (sin < 0) {
                    out.rotate = 360 - out.rotate;
                }
            } else {
                out.rotate = R.deg(math.asin(sin));
            }

            out.isSimple = !+out.shear.toFixed(9) && (out.scalex.toFixed(9) == out.scaley.toFixed(9) || !out.rotate);
            out.isSuperSimple = !+out.shear.toFixed(9) && out.scalex.toFixed(9) == out.scaley.toFixed(9) && !out.rotate;
            out.noRotation = !+out.shear.toFixed(9) && !out.rotate;
            return out;
        };
        /*\
         * Matrix.toTransformString
         [ method ]
         **
         * Return transform string that represents given matrix
         = (string) transform string
         \*/
        matrixproto.toTransformString = function (shorter) {
            var s = shorter || this[split]();
            if (s.isSimple) {
                s.scalex = +s.scalex.toFixed(4);
                s.scaley = +s.scaley.toFixed(4);
                s.rotate = +s.rotate.toFixed(4);
                return  (s.dx || s.dy ? "t" + [s.dx, s.dy] : E) +
                    (s.scalex != 1 || s.scaley != 1 ? "s" + [s.scalex, s.scaley, 0, 0] : E) +
                    (s.rotate ? "r" + [s.rotate, 0, 0] : E);
            } else {
                return "m" + [this.get(0), this.get(1), this.get(2), this.get(3), this.get(4), this.get(5)];
            }
        };
    })(Matrix.prototype);

    // WebKit rendering bug workaround method
    var version = navigator.userAgent.match(/Version\/(.*?)\s/) || navigator.userAgent.match(/Chrome\/(\d+)/);
    if ((navigator.vendor == "Apple Computer, Inc.") && (version && version[1] < 4 || navigator.platform.slice(0, 2) == "iP") ||
        (navigator.vendor == "Google Inc." && version && version[1] < 8)) {
        /*\
         * Paper.safari
         [ method ]
         **
         * There is an inconvenient rendering bug in Safari (WebKit):
         * sometimes the rendering should be forced.
         * This method should help with dealing with this bug.
         \*/
        paperproto.safari = function () {
            var rect = this.rect(-99, -99, this.width + 99, this.height + 99).attr({stroke: "none"});
            setTimeout(function () {rect.remove();});
        };
    } else {
        paperproto.safari = fun;
    }

    var preventDefault = function () {
            this.returnValue = false;
        },
        preventTouch = function () {
            return this.originalEvent.preventDefault();
        },
        stopPropagation = function () {
            this.cancelBubble = true;
        },
        stopTouch = function () {
            return this.originalEvent.stopPropagation();
        },
        addEvent = (function () {
            if (g.doc.addEventListener) {
                return function (obj, type, fn, element) {
                    var realName = supportsTouch && touchMap[type] ? touchMap[type] : type,
                        f = function (e) {
                            var scrollY = g.doc.documentElement.scrollTop || g.doc.body.scrollTop,
                                scrollX = g.doc.documentElement.scrollLeft || g.doc.body.scrollLeft,
                                x = e.clientX + scrollX,
                                y = e.clientY + scrollY;
                            if (supportsTouch && touchMap[has](type)) {
                                for (var i = 0, ii = e.targetTouches && e.targetTouches.length; i < ii; i++) {
                                    if (e.targetTouches[i].target == obj) {
                                        var olde = e;
                                        e = e.targetTouches[i];
                                        e.originalEvent = olde;
                                        e.preventDefault = preventTouch;
                                        e.stopPropagation = stopTouch;
                                        break;
                                    }
                                }
                            }
                            return fn.call(element, e, x, y);
                        };
                    obj.addEventListener(realName, f, false);
                    return function () {
                        obj.removeEventListener(realName, f, false);
                        return true;
                    };
                };
            } else if (g.doc.attachEvent) {
                return function (obj, type, fn, element) {
                    var f = function (e) {
                        e = e || g.win.event;
                        var scrollY = g.doc.documentElement.scrollTop || g.doc.body.scrollTop,
                            scrollX = g.doc.documentElement.scrollLeft || g.doc.body.scrollLeft,
                            x = e.clientX + scrollX,
                            y = e.clientY + scrollY;
                        e.preventDefault = e.preventDefault || preventDefault;
                        e.stopPropagation = e.stopPropagation || stopPropagation;
                        return fn.call(element, e, x, y);
                    };
                    obj.attachEvent("on" + type, f);
                    var detacher = function () {
                        obj.detachEvent("on" + type, f);
                        return true;
                    };
                    return detacher;
                };
            }
        })(),
        drag = [],
        dragMove = function (e) {
            var x = e.clientX,
                y = e.clientY,
                scrollY = g.doc.documentElement.scrollTop || g.doc.body.scrollTop,
                scrollX = g.doc.documentElement.scrollLeft || g.doc.body.scrollLeft,
                dragi,
                j = drag.length;
            while (j--) {
                dragi = drag[j];
                if (supportsTouch) {
                    var i = e.touches.length,
                        touch;
                    while (i--) {
                        touch = e.touches[i];
                        if (touch.identifier == dragi.el._drag.id) {
                            x = touch.clientX;
                            y = touch.clientY;
                            (e.originalEvent ? e.originalEvent : e).preventDefault();
                            break;
                        }
                    }
                } else {
                    e.preventDefault();
                }
                var node = dragi.el.node,
                    o,
                    next = node.nextSibling,
                    parent = node.parentNode,
                    display = node.style.display;
                g.win.opera && parent.removeChild(node);
                node.style.display = "none";
                o = dragi.el.paper.getElementByPoint(x, y);
                node.style.display = display;
                g.win.opera && (next ? parent.insertBefore(node, next) : parent.appendChild(node));
                o && eve("raphael.drag.over." + dragi.el.id, dragi.el, o);
                x += scrollX;
                y += scrollY;
                eve("raphael.drag.move." + dragi.el.id, dragi.move_scope || dragi.el, x - dragi.el._drag.x, y - dragi.el._drag.y, x, y, e);
            }
        },
        dragUp = function (e) {
            R.unmousemove(dragMove).unmouseup(dragUp);
            var i = drag.length,
                dragi;
            while (i--) {
                dragi = drag[i];
                dragi.el._drag = {};
                eve("raphael.drag.end." + dragi.el.id, dragi.end_scope || dragi.start_scope || dragi.move_scope || dragi.el, e);
            }
            drag = [];
        },
    /*\
     * Raphael.el
     [ property (object) ]
     **
     * You can add your own method to elements. This is usefull when you want to hack default functionality or
     * want to wrap some common transformation or attributes in one method. In difference to canvas methods,
     * you can redefine element method at any time. Expending element methods wouldn’t affect set.
     > Usage
     | Raphael.el.red = function () {
     |     this.attr({fill: "#f00"});
     | };
     | // then use it
     | paper.circle(100, 100, 20).red();
     \*/
        elproto = R.el = {};
    /*\
     * Element.click
     [ method ]
     **
     * Adds event handler for click for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
     \*/
    /*\
     * Element.unclick
     [ method ]
     **
     * Removes event handler for click for the element.
     > Parameters
     - handler (function) #optional handler for the event
     = (object) @Element
     \*/

    /*\
     * Element.dblclick
     [ method ]
     **
     * Adds event handler for double click for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
     \*/
    /*\
     * Element.undblclick
     [ method ]
     **
     * Removes event handler for double click for the element.
     > Parameters
     - handler (function) #optional handler for the event
     = (object) @Element
     \*/

    /*\
     * Element.mousedown
     [ method ]
     **
     * Adds event handler for mousedown for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
     \*/
    /*\
     * Element.unmousedown
     [ method ]
     **
     * Removes event handler for mousedown for the element.
     > Parameters
     - handler (function) #optional handler for the event
     = (object) @Element
     \*/

    /*\
     * Element.mousemove
     [ method ]
     **
     * Adds event handler for mousemove for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
     \*/
    /*\
     * Element.unmousemove
     [ method ]
     **
     * Removes event handler for mousemove for the element.
     > Parameters
     - handler (function) #optional handler for the event
     = (object) @Element
     \*/

    /*\
     * Element.mouseout
     [ method ]
     **
     * Adds event handler for mouseout for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
     \*/
    /*\
     * Element.unmouseout
     [ method ]
     **
     * Removes event handler for mouseout for the element.
     > Parameters
     - handler (function) #optional handler for the event
     = (object) @Element
     \*/

    /*\
     * Element.mouseover
     [ method ]
     **
     * Adds event handler for mouseover for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
     \*/
    /*\
     * Element.unmouseover
     [ method ]
     **
     * Removes event handler for mouseover for the element.
     > Parameters
     - handler (function) #optional handler for the event
     = (object) @Element
     \*/

    /*\
     * Element.mouseup
     [ method ]
     **
     * Adds event handler for mouseup for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
     \*/
    /*\
     * Element.unmouseup
     [ method ]
     **
     * Removes event handler for mouseup for the element.
     > Parameters
     - handler (function) #optional handler for the event
     = (object) @Element
     \*/

    /*\
     * Element.touchstart
     [ method ]
     **
     * Adds event handler for touchstart for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
     \*/
    /*\
     * Element.untouchstart
     [ method ]
     **
     * Removes event handler for touchstart for the element.
     > Parameters
     - handler (function) #optional handler for the event
     = (object) @Element
     \*/

    /*\
     * Element.touchmove
     [ method ]
     **
     * Adds event handler for touchmove for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
     \*/
    /*\
     * Element.untouchmove
     [ method ]
     **
     * Removes event handler for touchmove for the element.
     > Parameters
     - handler (function) #optional handler for the event
     = (object) @Element
     \*/

    /*\
     * Element.touchend
     [ method ]
     **
     * Adds event handler for touchend for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
     \*/
    /*\
     * Element.untouchend
     [ method ]
     **
     * Removes event handler for touchend for the element.
     > Parameters
     - handler (function) #optional handler for the event
     = (object) @Element
     \*/

    /*\
     * Element.touchcancel
     [ method ]
     **
     * Adds event handler for touchcancel for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
     \*/
    /*\
     * Element.untouchcancel
     [ method ]
     **
     * Removes event handler for touchcancel for the element.
     > Parameters
     - handler (function) #optional handler for the event
     = (object) @Element
     \*/
    for (var i = events.length; i--;) {
        (function (eventName) {
            R[eventName] = elproto[eventName] = function (fn, scope) {
                if (R.is(fn, "function")) {
                    this.events = this.events || [];
                    this.events.push({name: eventName, f: fn, unbind: addEvent(this.shape || this.node || g.doc, eventName, fn, scope || this)});
                }
                return this;
            };
            R["un" + eventName] = elproto["un" + eventName] = function (fn) {
                var events = this.events || [],
                    l = events.length;
                while (l--){
                    if (events[l].name == eventName && (R.is(fn, "undefined") || events[l].f == fn)) {
                        events[l].unbind();
                        events.splice(l, 1);
                        !events.length && delete this.events;
                    }
                }
                return this;
            };
        })(events[i]);
    }

    /*\
     * Element.data
     [ method ]
     **
     * Adds or retrieves given value asociated with given key.
     **
     * See also @Element.removeData
     > Parameters
     - key (string) key to store data
     - value (any) #optional value to store
     = (object) @Element
     * or, if value is not specified:
     = (any) value
     * or, if key and value are not specified:
     = (object) Key/value pairs for all the data associated with the element.
     > Usage
     | for (var i = 0, i < 5, i++) {
     |     paper.circle(10 + 15 * i, 10, 10)
     |          .attr({fill: "#000"})
     |          .data("i", i)
     |          .click(function () {
     |             alert(this.data("i"));
     |          });
     | }
     \*/
    elproto.data = function (key, value) {
        var data = eldata[this.id] = eldata[this.id] || {};
        if (arguments.length == 0) {
            return data;
        }
        if (arguments.length == 1) {
            if (R.is(key, "object")) {
                for (var i in key) if (key[has](i)) {
                    this.data(i, key[i]);
                }
                return this;
            }
            eve("raphael.data.get." + this.id, this, data[key], key);
            return data[key];
        }
        data[key] = value;
        eve("raphael.data.set." + this.id, this, value, key);
        return this;
    };
    /*\
     * Element.removeData
     [ method ]
     **
     * Removes value associated with an element by given key.
     * If key is not provided, removes all the data of the element.
     > Parameters
     - key (string) #optional key
     = (object) @Element
     \*/
    elproto.removeData = function (key) {
        if (key == null) {
            eldata[this.id] = {};
        } else {
            eldata[this.id] && delete eldata[this.id][key];
        }
        return this;
    };
    /*\
     * Element.getData
     [ method ]
     **
     * Retrieves the element data
     = (object) data
     \*/
    elproto.getData = function () {
        return clone(eldata[this.id] || {});
    };
    /*\
     * Element.hover
     [ method ]
     **
     * Adds event handlers for hover for the element.
     > Parameters
     - f_in (function) handler for hover in
     - f_out (function) handler for hover out
     - icontext (object) #optional context for hover in handler
     - ocontext (object) #optional context for hover out handler
     = (object) @Element
     \*/
    elproto.hover = function (f_in, f_out, scope_in, scope_out) {
        return this.mouseover(f_in, scope_in).mouseout(f_out, scope_out || scope_in);
    };
    /*\
     * Element.unhover
     [ method ]
     **
     * Removes event handlers for hover for the element.
     > Parameters
     - f_in (function) handler for hover in
     - f_out (function) handler for hover out
     = (object) @Element
     \*/
    elproto.unhover = function (f_in, f_out) {
        return this.unmouseover(f_in).unmouseout(f_out);
    };
    var draggable = [];
    /*\
     * Element.drag
     [ method ]
     **
     * Adds event handlers for drag of the element.
     > Parameters
     - onmove (function) handler for moving
     - onstart (function) handler for drag start
     - onend (function) handler for drag end
     - mcontext (object) #optional context for moving handler
     - scontext (object) #optional context for drag start handler
     - econtext (object) #optional context for drag end handler
     * Additionaly following `drag` events will be triggered: `drag.start.<id>` on start,
     * `drag.end.<id>` on end and `drag.move.<id>` on every move. When element will be dragged over another element
     * `drag.over.<id>` will be fired as well.
     *
     * Start event and start handler will be called in specified context or in context of the element with following parameters:
     o x (number) x position of the mouse
     o y (number) y position of the mouse
     o event (object) DOM event object
     * Move event and move handler will be called in specified context or in context of the element with following parameters:
     o dx (number) shift by x from the start point
     o dy (number) shift by y from the start point
     o x (number) x position of the mouse
     o y (number) y position of the mouse
     o event (object) DOM event object
     * End event and end handler will be called in specified context or in context of the element with following parameters:
     o event (object) DOM event object
     = (object) @Element
     \*/
    elproto.drag = function (onmove, onstart, onend, move_scope, start_scope, end_scope) {
        function start(e) {
            (e.originalEvent || e).preventDefault();
            var scrollY = g.doc.documentElement.scrollTop || g.doc.body.scrollTop,
                scrollX = g.doc.documentElement.scrollLeft || g.doc.body.scrollLeft;
            this._drag.x = e.clientX + scrollX;
            this._drag.y = e.clientY + scrollY;
            this._drag.id = e.identifier;
            !drag.length && R.mousemove(dragMove).mouseup(dragUp);
            drag.push({el: this, move_scope: move_scope, start_scope: start_scope, end_scope: end_scope});
            onstart && eve.on("raphael.drag.start." + this.id, onstart);
            onmove && eve.on("raphael.drag.move." + this.id, onmove);
            onend && eve.on("raphael.drag.end." + this.id, onend);
            eve("raphael.drag.start." + this.id, start_scope || move_scope || this, e.clientX + scrollX, e.clientY + scrollY, e);
        }
        this._drag = {};
        draggable.push({el: this, start: start});
        this.mousedown(start);
        return this;
    };
    /*\
     * Element.onDragOver
     [ method ]
     **
     * Shortcut for assigning event handler for `drag.over.<id>` event, where id is id of the element (see @Element.id).
     > Parameters
     - f (function) handler for event, first argument would be the element you are dragging over
     \*/
    elproto.onDragOver = function (f) {
        f ? eve.on("raphael.drag.over." + this.id, f) : eve.unbind("raphael.drag.over." + this.id);
    };
    /*\
     * Element.undrag
     [ method ]
     **
     * Removes all drag event handlers from given element.
     \*/
    elproto.undrag = function () {
        var i = draggable.length;
        while (i--) if (draggable[i].el == this) {
            this.unmousedown(draggable[i].start);
            draggable.splice(i, 1);
            eve.unbind("raphael.drag.*." + this.id);
        }
        !draggable.length && R.unmousemove(dragMove).unmouseup(dragUp);
        drag = [];
    };
    /*\
     * Paper.circle
     [ method ]
     **
     * Draws a circle.
     **
     > Parameters
     **
     - x (number) x coordinate of the centre
     - y (number) y coordinate of the centre
     - r (number) radius
     = (object) Raphaël element object with type “circle”
     **
     > Usage
     | var c = paper.circle(50, 50, 40);
     \*/
    paperproto.circle = function (x, y, r) {
        var out = R._engine.circle(this, x || 0, y || 0, r || 0);
        this.__set__ && this.__set__.push(out);
        return out;
    };
    /*\
     * Paper.rect
     [ method ]
     *
     * Draws a rectangle.
     **
     > Parameters
     **
     - x (number) x coordinate of the top left corner
     - y (number) y coordinate of the top left corner
     - width (number) width
     - height (number) height
     - r (number) #optional radius for rounded corners, default is 0
     = (object) Raphaël element object with type “rect”
     **
     > Usage
     | // regular rectangle
     | var c = paper.rect(10, 10, 50, 50);
     | // rectangle with rounded corners
     | var c = paper.rect(40, 40, 50, 50, 10);
     \*/
    paperproto.rect = function (x, y, w, h, r) {
        var out = R._engine.rect(this, x || 0, y || 0, w || 0, h || 0, r || 0);
        this.__set__ && this.__set__.push(out);
        return out;
    };
    /*\
     * Paper.ellipse
     [ method ]
     **
     * Draws an ellipse.
     **
     > Parameters
     **
     - x (number) x coordinate of the centre
     - y (number) y coordinate of the centre
     - rx (number) horizontal radius
     - ry (number) vertical radius
     = (object) Raphaël element object with type “ellipse”
     **
     > Usage
     | var c = paper.ellipse(50, 50, 40, 20);
     \*/
    paperproto.ellipse = function (x, y, rx, ry) {
        var out = R._engine.ellipse(this, x || 0, y || 0, rx || 0, ry || 0);
        this.__set__ && this.__set__.push(out);
        return out;
    };
    /*\
     * Paper.path
     [ method ]
     **
     * Creates a path element by given path data string.
     > Parameters
     - pathString (string) #optional path string in SVG format.
     * Path string consists of one-letter commands, followed by comma seprarated arguments in numercal form. Example:
     | "M10,20L30,40"
     * Here we can see two commands: “M”, with arguments `(10, 20)` and “L” with arguments `(30, 40)`. Upper case letter mean command is absolute, lower case—relative.
     *
     # <p>Here is short list of commands available, for more details see <a href="http://www.w3.org/TR/SVG/paths.html#PathData" title="Details of a path's data attribute's format are described in the SVG specification.">SVG path string format</a>.</p>
     # <table><thead><tr><th>Command</th><th>Name</th><th>Parameters</th></tr></thead><tbody>
     # <tr><td>M</td><td>moveto</td><td>(x y)+</td></tr>
     # <tr><td>Z</td><td>closepath</td><td>(none)</td></tr>
     # <tr><td>L</td><td>lineto</td><td>(x y)+</td></tr>
     # <tr><td>H</td><td>horizontal lineto</td><td>x+</td></tr>
     # <tr><td>V</td><td>vertical lineto</td><td>y+</td></tr>
     # <tr><td>C</td><td>curveto</td><td>(x1 y1 x2 y2 x y)+</td></tr>
     # <tr><td>S</td><td>smooth curveto</td><td>(x2 y2 x y)+</td></tr>
     # <tr><td>Q</td><td>quadratic Bézier curveto</td><td>(x1 y1 x y)+</td></tr>
     # <tr><td>T</td><td>smooth quadratic Bézier curveto</td><td>(x y)+</td></tr>
     # <tr><td>A</td><td>elliptical arc</td><td>(rx ry x-axis-rotation large-arc-flag sweep-flag x y)+</td></tr>
     # <tr><td>R</td><td><a href="http://en.wikipedia.org/wiki/Catmull–Rom_spline#Catmull.E2.80.93Rom_spline">Catmull-Rom curveto</a>*</td><td>x1 y1 (x y)+</td></tr></tbody></table>
     * * “Catmull-Rom curveto” is a not standard SVG command and added in 2.0 to make life easier.
     * Note: there is a special case when path consist of just three commands: “M10,10R…z”. In this case path will smoothly connects to its beginning.
     > Usage
     | var c = paper.path("M10 10L90 90");
     | // draw a diagonal line:
     | // move to 10,10, line to 90,90
     * For example of path strings, check out these icons: http://raphaeljs.com/icons/
     \*/
    paperproto.path = function (pathString) {
        pathString && !R.is(pathString, string) && !R.is(pathString[0], array) && (pathString += E);
        var out = R._engine.path(R.format[apply](R, arguments), this);
        this.__set__ && this.__set__.push(out);
        return out;
    };
    /*\
     * Paper.image
     [ method ]
     **
     * Embeds an image into the surface.
     **
     > Parameters
     **
     - src (string) URI of the source image
     - x (number) x coordinate position
     - y (number) y coordinate position
     - width (number) width of the image
     - height (number) height of the image
     = (object) Raphaël element object with type “image”
     **
     > Usage
     | var c = paper.image("apple.png", 10, 10, 80, 80);
     \*/
    paperproto.image = function (src, x, y, w, h) {
        var out = R._engine.image(this, src || "about:blank", x || 0, y || 0, w || 0, h || 0);
        this.__set__ && this.__set__.push(out);
        return out;
    };
    /*\
     * Paper.text
     [ method ]
     **
     * Draws a text string. If you need line breaks, put “\n” in the string.
     **
     > Parameters
     **
     - x (number) x coordinate position
     - y (number) y coordinate position
     - text (string) The text string to draw
     = (object) Raphaël element object with type “text”
     **
     > Usage
     | var t = paper.text(50, 50, "Raphaël\nkicks\nbutt!");
     \*/
    paperproto.text = function (x, y, text) {
        var out = R._engine.text(this, x || 0, y || 0, Str(text));
        this.__set__ && this.__set__.push(out);
        return out;
    };
    /*\
     * Paper.set
     [ method ]
     **
     * Creates array-like object to keep and operate several elements at once.
     * Warning: it doesn’t create any elements for itself in the page, it just groups existing elements.
     * Sets act as pseudo elements — all methods available to an element can be used on a set.
     = (object) array-like object that represents set of elements
     **
     > Usage
     | var st = paper.set();
     | st.push(
     |     paper.circle(10, 10, 5),
     |     paper.circle(30, 10, 5)
     | );
     | st.attr({fill: "red"}); // changes the fill of both circles
     \*/
    paperproto.set = function (itemsArray) {
        !R.is(itemsArray, "array") && (itemsArray = Array.prototype.splice.call(arguments, 0, arguments.length));
        var out = new Set(itemsArray);
        this.__set__ && this.__set__.push(out);
        out["paper"] = this;
        out["type"] = "set";
        return out;
    };
    /*\
     * Paper.setStart
     [ method ]
     **
     * Creates @Paper.set. All elements that will be created after calling this method and before calling
     * @Paper.setFinish will be added to the set.
     **
     > Usage
     | paper.setStart();
     | paper.circle(10, 10, 5),
     | paper.circle(30, 10, 5)
     | var st = paper.setFinish();
     | st.attr({fill: "red"}); // changes the fill of both circles
     \*/
    paperproto.setStart = function (set) {
        this.__set__ = set || this.set();
    };
    /*\
     * Paper.setFinish
     [ method ]
     **
     * See @Paper.setStart. This method finishes catching and returns resulting set.
     **
     = (object) set
     \*/
    paperproto.setFinish = function (set) {
        var out = this.__set__;
        delete this.__set__;
        return out;
    };
    /*\
     * Paper.setSize
     [ method ]
     **
     * If you need to change dimensions of the canvas call this method
     **
     > Parameters
     **
     - width (number) new width of the canvas
     - height (number) new height of the canvas
     \*/
    paperproto.setSize = function (width, height) {
        return R._engine.setSize.call(this, width, height);
    };
    /*\
     * Paper.setViewBox
     [ method ]
     **
     * Sets the view box of the paper. Practically it gives you ability to zoom and pan whole paper surface by
     * specifying new HTMap.Boundaries.
     **
     > Parameters
     **
     - x (number) new x position, default is `0`
     - y (number) new y position, default is `0`
     - w (number) new width of the canvas
     - h (number) new height of the canvas
     - fit (boolean) `true` if you want graphics to fit into new HTMap.Boundary box
     \*/
    paperproto.setViewBox = function (x, y, w, h, fit) {
        return R._engine.setViewBox.call(this, x, y, w, h, fit);
    };
    /*\
     * Paper.top
     [ property ]
     **
     * Points to the topmost element on the paper
     \*/
    /*\
     * Paper.bottom
     [ property ]
     **
     * Points to the bottom element on the paper
     \*/
    paperproto.top = paperproto.bottom = null;
    /*\
     * Paper.raphael
     [ property ]
     **
     * Points to the @Raphael object/function
     \*/
    paperproto.raphael = R;
    var getOffset = function (elem) {
        var box = elem.getBoundingClientRect(),
            doc = elem.ownerDocument,
            body = doc.body,
            docElem = doc.documentElement,
            clientTop = docElem.clientTop || body.clientTop || 0, clientLeft = docElem.clientLeft || body.clientLeft || 0,
            top  = box.top  + (g.win.pageYOffset || docElem.scrollTop || body.scrollTop ) - clientTop,
            left = box.left + (g.win.pageXOffset || docElem.scrollLeft || body.scrollLeft) - clientLeft;
        return {
            y: top,
            x: left
        };
    };
    /*\
     * Paper.getElementByPoint
     [ method ]
     **
     * Returns you topmost element under given point.
     **
     = (object) Raphaël element object
     > Parameters
     **
     - x (number) x coordinate from the top left corner of the window
     - y (number) y coordinate from the top left corner of the window
     > Usage
     | paper.getElementByPoint(mouseX, mouseY).attr({stroke: "#f00"});
     \*/
    paperproto.getElementByPoint = function (x, y) {
        var paper = this,
            svg = paper.canvas,
            target = g.doc.elementFromPoint(x, y);
        if (g.win.opera && target.tagName == "svg") {
            var so = getOffset(svg),
                sr = svg.createSVGRect();
            sr.x = x - so.x;
            sr.y = y - so.y;
            sr.width = sr.height = 1;
            var hits = svg.getIntersectionList(sr, null);
            if (hits.length) {
                target = hits[hits.length - 1];
            }
        }
        if (!target) {
            return null;
        }
        while (target.parentNode && target != svg.parentNode && !target.raphael) {
            target = target.parentNode;
        }
        target == paper.canvas.parentNode && (target = svg);
        target = target && target.raphael ? paper.getById(target.raphaelid) : null;
        return target;
    };

    /*\
     * Paper.getElementsByBBox
     [ method ]
     **
     * Returns set of elements that have an intersecting bounding box
     **
     > Parameters
     **
     - bbox (object) bbox to check with
     = (object) @Set
     \*/
    paperproto.getElementsByBBox = function (bbox) {
        var set = this.set();
        this.forEach(function (el) {
            if (R.isBBoxIntersect(el.getBBox(), bbox)) {
                set.push(el);
            }
        });
        return set;
    };

    /*\
     * Paper.getById
     [ method ]
     **
     * Returns you element by its internal ID.
     **
     > Parameters
     **
     - id (number) id
     = (object) Raphaël element object
     \*/
    paperproto.getById = function (id) {
        var bot = this.bottom;
        while (bot) {
            if (bot.id == id) {
                return bot;
            }
            bot = bot.next;
        }
        return null;
    };
    /*\
     * Paper.forEach
     [ method ]
     **
     * Executes given function for each element on the paper
     *
     * If callback function returns `false` it will stop loop running.
     **
     > Parameters
     **
     - callback (function) function to run
     - thisArg (object) context object for the callback
     = (object) Paper object
     > Usage
     | paper.forEach(function (el) {
     |     el.attr({ stroke: "blue" });
     | });
     \*/
    paperproto.forEach = function (callback, thisArg) {
        var bot = this.bottom;
        while (bot) {
            if (callback.call(thisArg, bot) === false) {
                return this;
            }
            bot = bot.next;
        }
        return this;
    };
    /*\
     * Paper.getElementsByPoint
     [ method ]
     **
     * Returns set of elements that have common point inside
     **
     > Parameters
     **
     - x (number) x coordinate of the point
     - y (number) y coordinate of the point
     = (object) @Set
     \*/
    paperproto.getElementsByPoint = function (x, y) {
        var set = this.set();
        this.forEach(function (el) {
            if (el.isPointInside(x, y)) {
                set.push(el);
            }
        });
        return set;
    };
    function x_y() {
        return this.x + S + this.y;
    }
    function x_y_w_h() {
        return this.x + S + this.y + S + this.width + " \xd7 " + this.height;
    }
    /*\
     * Element.isPointInside
     [ method ]
     **
     * Determine if given point is inside this element’s shape
     **
     > Parameters
     **
     - x (number) x coordinate of the point
     - y (number) y coordinate of the point
     = (boolean) `true` if point inside the shape
     \*/
    elproto.isPointInside = function (x, y) {
        var rp = this.realPath = this.realPath || getPath[this.type](this);
        return R.isPointInsidePath(rp, x, y);
    };
    /*\
     * Element.getBBox
     [ method ]
     **
     * Return bounding box for a given element
     **
     > Parameters
     **
     - isWithoutTransform (boolean) flag, `true` if you want to have bounding box before transformations. Default is `false`.
     = (object) Bounding box object:
     o {
     o     x: (number) top left corner x
     o     y: (number) top left corner y
     o     x2: (number) bottom right corner x
     o     y2: (number) bottom right corner y
     o     width: (number) width
     o     height: (number) height
     o }
     \*/
    elproto.getBBox = function (isWithoutTransform) {
        if (this.removed) {
            return {};
        }
        var _ = this._;
        if (isWithoutTransform) {
            if (_.dirty || !_.bboxwt) {
                this.realPath = getPath[this.type](this);
                _.bboxwt = pathDimensions(this.realPath);
                _.bboxwt.toString = x_y_w_h;
                _.dirty = 0;
            }
            return _.bboxwt;
        }
        if (_.dirty || _.dirtyT || !_.bbox) {
            if (_.dirty || !this.realPath) {
                _.bboxwt = 0;
                this.realPath = getPath[this.type](this);
            }
            _.bbox = pathDimensions(mapPath(this.realPath, this.matrix));
            _.bbox.toString = x_y_w_h;
            _.dirty = _.dirtyT = 0;
        }
        return _.bbox;
    };
    /*\
     * Element.clone
     [ method ]
     **
     = (object) clone of a given element
     **
     \*/
    elproto.clone = function () {
        if (this.removed) {
            return null;
        }
        var out = this.paper[this.type]().attr(this.attr());
        this.__set__ && this.__set__.push(out);
        return out;
    };
    /*\
     * Element.glow
     [ method ]
     **
     * Return set of elements that create glow-like effect around given element. See @Paper.set.
     *
     * Note: Glow is not connected to the element. If you change element attributes it won’t adjust itself.
     **
     > Parameters
     **
     - glow (object) #optional parameters object with all properties optional:
     o {
     o     width (number) size of the glow, default is `10`
     o     fill (boolean) will it be filled, default is `false`
     o     opacity (number) opacity, default is `0.5`
     o     offsetx (number) horizontal offset, default is `0`
     o     offsety (number) vertical offset, default is `0`
     o     color (string) glow colour, default is `black`
     o }
     = (object) @Paper.set of elements that represents glow
     \*/
    elproto.glow = function (glow) {
        if (this.type == "text") {
            return null;
        }
        glow = glow || {};
        var s = {
                width: (glow.width || 10) + (+this.attr("stroke-width") || 1),
                fill: glow.fill || false,
                opacity: glow.opacity || .5,
                offsetx: glow.offsetx || 0,
                offsety: glow.offsety || 0,
                color: glow.color || "#000"
            },
            c = s.width / 2,
            r = this.paper,
            out = r.set(),
            path = this.realPath || getPath[this.type](this);
        path = this.matrix ? mapPath(path, this.matrix) : path;
        for (var i = 1; i < c + 1; i++) {
            out.push(r.path(path).attr({
                stroke: s.color,
                fill: s.fill ? s.color : "none",
                "stroke-linejoin": "round",
                "stroke-linecap": "round",
                "stroke-width": +(s.width / c * i).toFixed(3),
                opacity: +(s.opacity / c).toFixed(3)
            }));
        }
        return out.insertBefore(this).translate(s.offsetx, s.offsety);
    };
    var curveslengths = {},
        getPointAtSegmentLength = function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, length) {
            if (length == null) {
                return bezlen(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y);
            } else {
                return R.findDotsAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, getTatLen(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, length));
            }
        },
        getLengthFactory = function (istotal, subpath) {
            return function (path, length, onlystart) {
                path = path2curve(path);
                var x, y, p, l, sp = "", subpaths = {}, point,
                    len = 0;
                for (var i = 0, ii = path.length; i < ii; i++) {
                    p = path[i];
                    if (p[0] == "M") {
                        x = +p[1];
                        y = +p[2];
                    } else {
                        l = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6]);
                        if (len + l > length) {
                            if (subpath && !subpaths.start) {
                                point = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6], length - len);
                                sp += ["C" + point.start.x, point.start.y, point.m.x, point.m.y, point.x, point.y];
                                if (onlystart) {return sp;}
                                subpaths.start = sp;
                                sp = ["M" + point.x, point.y + "C" + point.n.x, point.n.y, point.end.x, point.end.y, p[5], p[6]].join();
                                len += l;
                                x = +p[5];
                                y = +p[6];
                                continue;
                            }
                            if (!istotal && !subpath) {
                                point = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6], length - len);
                                return {x: point.x, y: point.y, alpha: point.alpha};
                            }
                        }
                        len += l;
                        x = +p[5];
                        y = +p[6];
                    }
                    sp += p.shift() + p;
                }
                subpaths.end = sp;
                point = istotal ? len : subpath ? subpaths : R.findDotsAtSegment(x, y, p[0], p[1], p[2], p[3], p[4], p[5], 1);
                point.alpha && (point = {x: point.x, y: point.y, alpha: point.alpha});
                return point;
            };
        };
    var getTotalLength = getLengthFactory(1),
        getPointAtLength = getLengthFactory(),
        getSubpathsAtLength = getLengthFactory(0, 1);
    /*\
     * Raphael.getTotalLength
     [ method ]
     **
     * Returns length of the given path in pixels.
     **
     > Parameters
     **
     - path (string) SVG path string.
     **
     = (number) length.
     \*/
    R.getTotalLength = getTotalLength;
    /*\
     * Raphael.getPointAtLength
     [ method ]
     **
     * Return coordinates of the point located at the given length on the given path.
     **
     > Parameters
     **
     - path (string) SVG path string
     - length (number)
     **
     = (object) representation of the point:
     o {
     o     x: (number) x coordinate
     o     y: (number) y coordinate
     o     alpha: (number) angle of derivative
     o }
     \*/
    R.getPointAtLength = getPointAtLength;
    /*\
     * Raphael.getSubpath
     [ method ]
     **
     * Return subpath of a given path from given length to given length.
     **
     > Parameters
     **
     - path (string) SVG path string
     - from (number) position of the start of the segment
     - to (number) position of the end of the segment
     **
     = (string) pathstring for the segment
     \*/
    R.getSubpath = function (path, from, to) {
        if (this.getTotalLength(path) - to < 1e-6) {
            return getSubpathsAtLength(path, from).end;
        }
        var a = getSubpathsAtLength(path, to, 1);
        return from ? getSubpathsAtLength(a, from).end : a;
    };
    /*\
     * Element.getTotalLength
     [ method ]
     **
     * Returns length of the path in pixels. Only works for element of “path” type.
     = (number) length.
     \*/
    elproto.getTotalLength = function () {
        if (this.type != "path") {return;}
        if (this.node.getTotalLength) {
            return this.node.getTotalLength();
        }
        return getTotalLength(this.attrs.path);
    };
    /*\
     * Element.getPointAtLength
     [ method ]
     **
     * Return coordinates of the point located at the given length on the given path. Only works for element of “path” type.
     **
     > Parameters
     **
     - length (number)
     **
     = (object) representation of the point:
     o {
     o     x: (number) x coordinate
     o     y: (number) y coordinate
     o     alpha: (number) angle of derivative
     o }
     \*/
    elproto.getPointAtLength = function (length) {
        if (this.type != "path") {return;}
        return getPointAtLength(this.attrs.path, length);
    };
    /*\
     * Element.getSubpath
     [ method ]
     **
     * Return subpath of a given element from given length to given length. Only works for element of “path” type.
     **
     > Parameters
     **
     - from (number) position of the start of the segment
     - to (number) position of the end of the segment
     **
     = (string) pathstring for the segment
     \*/
    elproto.getSubpath = function (from, to) {
        if (this.type != "path") {return;}
        return R.getSubpath(this.attrs.path, from, to);
    };
    /*\
     * Raphael.easing_formulas
     [ property ]
     **
     * Object that contains easing formulas for animation. You could extend it with your own. By default it has following list of easing:
     # <ul>
     #     <li>“linear”</li>
     #     <li>“&lt;” or “easeIn” or “ease-in”</li>
     #     <li>“>” or “easeOut” or “ease-out”</li>
     #     <li>“&lt;>” or “easeInOut” or “ease-in-out”</li>
     #     <li>“backIn” or “back-in”</li>
     #     <li>“backOut” or “back-out”</li>
     #     <li>“elastic”</li>
     #     <li>“bounce”</li>
     # </ul>
     # <p>See also <a href="http://raphaeljs.com/easing.html">Easing demo</a>.</p>
     \*/
    var ef = R.easing_formulas = {
        linear: function (n) {
            return n;
        },
        "<": function (n) {
            return pow(n, 1.7);
        },
        ">": function (n) {
            return pow(n, .48);
        },
        "<>": function (n) {
            var q = .48 - n / 1.04,
                Q = math.sqrt(.1734 + q * q),
                x = Q - q,
                X = pow(abs(x), 1 / 3) * (x < 0 ? -1 : 1),
                y = -Q - q,
                Y = pow(abs(y), 1 / 3) * (y < 0 ? -1 : 1),
                t = X + Y + .5;
            return (1 - t) * 3 * t * t + t * t * t;
        },
        backIn: function (n) {
            var s = 1.70158;
            return n * n * ((s + 1) * n - s);
        },
        backOut: function (n) {
            n = n - 1;
            var s = 1.70158;
            return n * n * ((s + 1) * n + s) + 1;
        },
        elastic: function (n) {
            if (n == !!n) {
                return n;
            }
            return pow(2, -10 * n) * math.sin((n - .075) * (2 * PI) / .3) + 1;
        },
        bounce: function (n) {
            var s = 7.5625,
                p = 2.75,
                l;
            if (n < (1 / p)) {
                l = s * n * n;
            } else {
                if (n < (2 / p)) {
                    n -= (1.5 / p);
                    l = s * n * n + .75;
                } else {
                    if (n < (2.5 / p)) {
                        n -= (2.25 / p);
                        l = s * n * n + .9375;
                    } else {
                        n -= (2.625 / p);
                        l = s * n * n + .984375;
                    }
                }
            }
            return l;
        }
    };
    ef.easeIn = ef["ease-in"] = ef["<"];
    ef.easeOut = ef["ease-out"] = ef[">"];
    ef.easeInOut = ef["ease-in-out"] = ef["<>"];
    ef["back-in"] = ef.backIn;
    ef["back-out"] = ef.backOut;

    var animationElements = [],
        requestAnimFrame = window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function (callback) {
                setTimeout(callback, 16);
            },
        animation = function () {
            var Now = +new Date,
                l = 0;
            for (; l < animationElements.length; l++) {
                var e = animationElements[l];
                if (e.el.removed || e.paused) {
                    continue;
                }
                var time = Now - e.start,
                    ms = e.ms,
                    easing = e.easing,
                    from = e.from,
                    diff = e.diff,
                    to = e.to,
                    t = e.t,
                    that = e.el,
                    set = {},
                    now,
                    init = {},
                    key;
                if (e.initstatus) {
                    time = (e.initstatus * e.anim.top - e.prev) / (e.percent - e.prev) * ms;
                    e.status = e.initstatus;
                    delete e.initstatus;
                    e.stop && animationElements.splice(l--, 1);
                } else {
                    e.status = (e.prev + (e.percent - e.prev) * (time / ms)) / e.anim.top;
                }
                if (time < 0) {
                    continue;
                }
                if (time < ms) {
                    var pos = easing(time / ms);
                    for (var attr in from) if (from[has](attr)) {
                        switch (availableAnimAttrs[attr]) {
                            case nu:
                                now = +from[attr] + pos * ms * diff[attr];
                                break;
                            case "colour":
                                now = "rgb(" + [
                                        upto255(round(from[attr].r + pos * ms * diff[attr].r)),
                                        upto255(round(from[attr].g + pos * ms * diff[attr].g)),
                                        upto255(round(from[attr].b + pos * ms * diff[attr].b))
                                    ].join(",") + ")";
                                break;
                            case "path":
                                now = [];
                                for (var i = 0, ii = from[attr].length; i < ii; i++) {
                                    now[i] = [from[attr][i][0]];
                                    for (var j = 1, jj = from[attr][i].length; j < jj; j++) {
                                        now[i][j] = +from[attr][i][j] + pos * ms * diff[attr][i][j];
                                    }
                                    now[i] = now[i].join(S);
                                }
                                now = now.join(S);
                                break;
                            case "transform":
                                if (diff[attr].real) {
                                    now = [];
                                    for (i = 0, ii = from[attr].length; i < ii; i++) {
                                        now[i] = [from[attr][i][0]];
                                        for (j = 1, jj = from[attr][i].length; j < jj; j++) {
                                            now[i][j] = from[attr][i][j] + pos * ms * diff[attr][i][j];
                                        }
                                    }
                                } else {
                                    var get = function (i) {
                                        return +from[attr][i] + pos * ms * diff[attr][i];
                                    };
                                    // now = [["r", get(2), 0, 0], ["t", get(3), get(4)], ["s", get(0), get(1), 0, 0]];
                                    now = [["m", get(0), get(1), get(2), get(3), get(4), get(5)]];
                                }
                                break;
                            case "csv":
                                if (attr == "clip-rect") {
                                    now = [];
                                    i = 4;
                                    while (i--) {
                                        now[i] = +from[attr][i] + pos * ms * diff[attr][i];
                                    }
                                }
                                break;
                            default:
                                var from2 = [][concat](from[attr]);
                                now = [];
                                i = that.paper.customAttributes[attr].length;
                                while (i--) {
                                    now[i] = +from2[i] + pos * ms * diff[attr][i];
                                }
                                break;
                        }
                        set[attr] = now;
                    }
                    that.attr(set);
                    (function (id, that, anim) {
                        setTimeout(function () {
                            eve("raphael.anim.frame." + id, that, anim);
                        });
                    })(that.id, that, e.anim);
                } else {
                    (function(f, el, a) {
                        setTimeout(function() {
                            eve("raphael.anim.frame." + el.id, el, a);
                            eve("raphael.anim.finish." + el.id, el, a);
                            R.is(f, "function") && f.call(el);
                        });
                    })(e.callback, that, e.anim);
                    that.attr(to);
                    animationElements.splice(l--, 1);
                    if (e.repeat > 1 && !e.next) {
                        for (key in to) if (to[has](key)) {
                            init[key] = e.totalOrigin[key];
                        }
                        e.el.attr(init);
                        runAnimation(e.anim, e.el, e.anim.percents[0], null, e.totalOrigin, e.repeat - 1);
                    }
                    if (e.next && !e.stop) {
                        runAnimation(e.anim, e.el, e.next, null, e.totalOrigin, e.repeat);
                    }
                }
            }
            R.svg && that && that.paper && that.paper.safari();
            animationElements.length && requestAnimFrame(animation);
        },
        upto255 = function (color) {
            return color > 255 ? 255 : color < 0 ? 0 : color;
        };
    /*\
     * Element.animateWith
     [ method ]
     **
     * Acts similar to @Element.animate, but ensure that given animation runs in sync with another given element.
     **
     > Parameters
     **
     - el (object) element to sync with
     - anim (object) animation to sync with
     - params (object) #optional final attributes for the element, see also @Element.attr
     - ms (number) #optional number of milliseconds for animation to run
     - easing (string) #optional easing type. Accept on of @Raphael.easing_formulas or CSS format: `cubic&#x2010;bezier(XX,&#160;XX,&#160;XX,&#160;XX)`
     - callback (function) #optional callback function. Will be called at the end of animation.
     * or
     - element (object) element to sync with
     - anim (object) animation to sync with
     - animation (object) #optional animation object, see @Raphael.animation
     **
     = (object) original element
     \*/
    elproto.animateWith = function (el, anim, params, ms, easing, callback) {
        var element = this;
        if (element.removed) {
            callback && callback.call(element);
            return element;
        }
        var a = params instanceof Animation ? params : R.animation(params, ms, easing, callback),
            x, y;
        runAnimation(a, element, a.percents[0], null, element.attr());
        for (var i = 0, ii = animationElements.length; i < ii; i++) {
            if (animationElements[i].anim == anim && animationElements[i].el == el) {
                animationElements[ii - 1].start = animationElements[i].start;
                break;
            }
        }
        return element;
        //
        //
        // var a = params ? R.animation(params, ms, easing, callback) : anim,
        //     status = element.status(anim);
        // return this.animate(a).status(a, status * anim.ms / a.ms);
    };
    function CubicBezierAtTime(t, p1x, p1y, p2x, p2y, duration) {
        var cx = 3 * p1x,
            bx = 3 * (p2x - p1x) - cx,
            ax = 1 - cx - bx,
            cy = 3 * p1y,
            by = 3 * (p2y - p1y) - cy,
            ay = 1 - cy - by;
        function sampleCurveX(t) {
            return ((ax * t + bx) * t + cx) * t;
        }
        function solve(x, epsilon) {
            var t = solveCurveX(x, epsilon);
            return ((ay * t + by) * t + cy) * t;
        }
        function solveCurveX(x, epsilon) {
            var t0, t1, t2, x2, d2, i;
            for(t2 = x, i = 0; i < 8; i++) {
                x2 = sampleCurveX(t2) - x;
                if (abs(x2) < epsilon) {
                    return t2;
                }
                d2 = (3 * ax * t2 + 2 * bx) * t2 + cx;
                if (abs(d2) < 1e-6) {
                    break;
                }
                t2 = t2 - x2 / d2;
            }
            t0 = 0;
            t1 = 1;
            t2 = x;
            if (t2 < t0) {
                return t0;
            }
            if (t2 > t1) {
                return t1;
            }
            while (t0 < t1) {
                x2 = sampleCurveX(t2);
                if (abs(x2 - x) < epsilon) {
                    return t2;
                }
                if (x > x2) {
                    t0 = t2;
                } else {
                    t1 = t2;
                }
                t2 = (t1 - t0) / 2 + t0;
            }
            return t2;
        }
        return solve(t, 1 / (200 * duration));
    }
    elproto.onAnimation = function (f) {
        f ? eve.on("raphael.anim.frame." + this.id, f) : eve.unbind("raphael.anim.frame." + this.id);
        return this;
    };
    function Animation(anim, ms) {
        var percents = [],
            newAnim = {};
        this.ms = ms;
        this.times = 1;
        if (anim) {
            for (var attr in anim) if (anim[has](attr)) {
                newAnim[toFloat(attr)] = anim[attr];
                percents.push(toFloat(attr));
            }
            percents.sort(sortByNumber);
        }
        this.anim = newAnim;
        this.top = percents[percents.length - 1];
        this.percents = percents;
    }
    /*\
     * Animation.delay
     [ method ]
     **
     * Creates a copy of existing animation object with given delay.
     **
     > Parameters
     **
     - delay (number) number of ms to pass between animation start and actual animation
     **
     = (object) new altered Animation object
     | var anim = Raphael.animation({cx: 10, cy: 20}, 2e3);
     | circle1.animate(anim); // run the given animation immediately
     | circle2.animate(anim.delay(500)); // run the given animation after 500 ms
     \*/
    Animation.prototype.delay = function (delay) {
        var a = new Animation(this.anim, this.ms);
        a.times = this.times;
        a.del = +delay || 0;
        return a;
    };
    /*\
     * Animation.repeat
     [ method ]
     **
     * Creates a copy of existing animation object with given repetition.
     **
     > Parameters
     **
     - repeat (number) number iterations of animation. For infinite animation pass `Infinity`
     **
     = (object) new altered Animation object
     \*/
    Animation.prototype.repeat = function (times) {
        var a = new Animation(this.anim, this.ms);
        a.del = this.del;
        a.times = math.floor(mmax(times, 0)) || 1;
        return a;
    };
    function runAnimation(anim, element, percent, status, totalOrigin, times) {
        percent = toFloat(percent);
        var params,
            isInAnim,
            isInAnimSet,
            percents = [],
            next,
            prev,
            timestamp,
            ms = anim.ms,
            from = {},
            to = {},
            diff = {};
        if (status) {
            for (i = 0, ii = animationElements.length; i < ii; i++) {
                var e = animationElements[i];
                if (e.el.id == element.id && e.anim == anim) {
                    if (e.percent != percent) {
                        animationElements.splice(i, 1);
                        isInAnimSet = 1;
                    } else {
                        isInAnim = e;
                    }
                    element.attr(e.totalOrigin);
                    break;
                }
            }
        } else {
            status = +to; // NaN
        }
        for (var i = 0, ii = anim.percents.length; i < ii; i++) {
            if (anim.percents[i] == percent || anim.percents[i] > status * anim.top) {
                percent = anim.percents[i];
                prev = anim.percents[i - 1] || 0;
                ms = ms / anim.top * (percent - prev);
                next = anim.percents[i + 1];
                params = anim.anim[percent];
                break;
            } else if (status) {
                element.attr(anim.anim[anim.percents[i]]);
            }
        }
        if (!params) {
            return;
        }
        if (!isInAnim) {
            for (var attr in params) if (params[has](attr)) {
                if (availableAnimAttrs[has](attr) || element.paper.customAttributes[has](attr)) {
                    from[attr] = element.attr(attr);
                    (from[attr] == null) && (from[attr] = availableAttrs[attr]);
                    to[attr] = params[attr];
                    switch (availableAnimAttrs[attr]) {
                        case nu:
                            diff[attr] = (to[attr] - from[attr]) / ms;
                            break;
                        case "colour":
                            from[attr] = R.getRGB(from[attr]);
                            var toColour = R.getRGB(to[attr]);
                            diff[attr] = {
                                r: (toColour.r - from[attr].r) / ms,
                                g: (toColour.g - from[attr].g) / ms,
                                b: (toColour.b - from[attr].b) / ms
                            };
                            break;
                        case "path":
                            var pathes = path2curve(from[attr], to[attr]),
                                toPath = pathes[1];
                            from[attr] = pathes[0];
                            diff[attr] = [];
                            for (i = 0, ii = from[attr].length; i < ii; i++) {
                                diff[attr][i] = [0];
                                for (var j = 1, jj = from[attr][i].length; j < jj; j++) {
                                    diff[attr][i][j] = (toPath[i][j] - from[attr][i][j]) / ms;
                                }
                            }
                            break;
                        case "transform":
                            var _ = element._,
                                eq = equaliseTransform(_[attr], to[attr]);
                            if (eq) {
                                from[attr] = eq.from;
                                to[attr] = eq.to;
                                diff[attr] = [];
                                diff[attr].real = true;
                                for (i = 0, ii = from[attr].length; i < ii; i++) {
                                    diff[attr][i] = [from[attr][i][0]];
                                    for (j = 1, jj = from[attr][i].length; j < jj; j++) {
                                        diff[attr][i][j] = (to[attr][i][j] - from[attr][i][j]) / ms;
                                    }
                                }
                            } else {
                                var m = (element.matrix || new Matrix),
                                    to2 = {
                                        _: {transform: _.transform},
                                        getBBox: function () {
                                            return element.getBBox(1);
                                        }
                                    };
                                from[attr] = [
                                    m.a,
                                    m.b,
                                    m.c,
                                    m.d,
                                    m.e,
                                    m.f
                                ];
                                extractTransform(to2, to[attr]);
                                to[attr] = to2._.transform;
                                diff[attr] = [
                                    (to2.matrix.a - m.a) / ms,
                                    (to2.matrix.b - m.b) / ms,
                                    (to2.matrix.c - m.c) / ms,
                                    (to2.matrix.d - m.d) / ms,
                                    (to2.matrix.e - m.e) / ms,
                                    (to2.matrix.f - m.f) / ms
                                ];
                                // from[attr] = [_.sx, _.sy, _.deg, _.dx, _.dy];
                                // var to2 = {_:{}, getBBox: function () { return element.getBBox(); }};
                                // extractTransform(to2, to[attr]);
                                // diff[attr] = [
                                //     (to2._.sx - _.sx) / ms,
                                //     (to2._.sy - _.sy) / ms,
                                //     (to2._.deg - _.deg) / ms,
                                //     (to2._.dx - _.dx) / ms,
                                //     (to2._.dy - _.dy) / ms
                                // ];
                            }
                            break;
                        case "csv":
                            var values = Str(params[attr])[split](separator),
                                from2 = Str(from[attr])[split](separator);
                            if (attr == "clip-rect") {
                                from[attr] = from2;
                                diff[attr] = [];
                                i = from2.length;
                                while (i--) {
                                    diff[attr][i] = (values[i] - from[attr][i]) / ms;
                                }
                            }
                            to[attr] = values;
                            break;
                        default:
                            values = [][concat](params[attr]);
                            from2 = [][concat](from[attr]);
                            diff[attr] = [];
                            i = element.paper.customAttributes[attr].length;
                            while (i--) {
                                diff[attr][i] = ((values[i] || 0) - (from2[i] || 0)) / ms;
                            }
                            break;
                    }
                }
            }
            var easing = params.easing,
                easyeasy = R.easing_formulas[easing];
            if (!easyeasy) {
                easyeasy = Str(easing).match(bezierrg);
                if (easyeasy && easyeasy.length == 5) {
                    var curve = easyeasy;
                    easyeasy = function (t) {
                        return CubicBezierAtTime(t, +curve[1], +curve[2], +curve[3], +curve[4], ms);
                    };
                } else {
                    easyeasy = pipe;
                }
            }
            timestamp = params.start || anim.start || +new Date;
            e = {
                anim: anim,
                percent: percent,
                timestamp: timestamp,
                start: timestamp + (anim.del || 0),
                status: 0,
                initstatus: status || 0,
                stop: false,
                ms: ms,
                easing: easyeasy,
                from: from,
                diff: diff,
                to: to,
                el: element,
                callback: params.callback,
                prev: prev,
                next: next,
                repeat: times || anim.times,
                origin: element.attr(),
                totalOrigin: totalOrigin
            };
            animationElements.push(e);
            if (status && !isInAnim && !isInAnimSet) {
                e.stop = true;
                e.start = new Date - ms * status;
                if (animationElements.length == 1) {
                    return animation();
                }
            }
            if (isInAnimSet) {
                e.start = new Date - e.ms * status;
            }
            animationElements.length == 1 && requestAnimFrame(animation);
        } else {
            isInAnim.initstatus = status;
            isInAnim.start = new Date - isInAnim.ms * status;
        }
        eve("raphael.anim.start." + element.id, element, anim);
    }
    /*\
     * Raphael.animation
     [ method ]
     **
     * Creates an animation object that can be passed to the @Element.animate or @Element.animateWith methods.
     * See also @Animation.delay and @Animation.repeat methods.
     **
     > Parameters
     **
     - params (object) final attributes for the element, see also @Element.attr
     - ms (number) number of milliseconds for animation to run
     - easing (string) #optional easing type. Accept one of @Raphael.easing_formulas or CSS format: `cubic&#x2010;bezier(XX,&#160;XX,&#160;XX,&#160;XX)`
     - callback (function) #optional callback function. Will be called at the end of animation.
     **
     = (object) @Animation
     \*/
    R.animation = function (params, ms, easing, callback) {
        if (params instanceof Animation) {
            return params;
        }
        if (R.is(easing, "function") || !easing) {
            callback = callback || easing || null;
            easing = null;
        }
        params = Object(params);
        ms = +ms || 0;
        var p = {},
            json,
            attr;
        for (attr in params) if (params[has](attr) && toFloat(attr) != attr && toFloat(attr) + "%" != attr) {
            json = true;
            p[attr] = params[attr];
        }
        if (!json) {
            return new Animation(params, ms);
        } else {
            easing && (p.easing = easing);
            callback && (p.callback = callback);
            return new Animation({100: p}, ms);
        }
    };
    /*\
     * Element.animate
     [ method ]
     **
     * Creates and starts animation for given element.
     **
     > Parameters
     **
     - params (object) final attributes for the element, see also @Element.attr
     - ms (number) number of milliseconds for animation to run
     - easing (string) #optional easing type. Accept one of @Raphael.easing_formulas or CSS format: `cubic&#x2010;bezier(XX,&#160;XX,&#160;XX,&#160;XX)`
     - callback (function) #optional callback function. Will be called at the end of animation.
     * or
     - animation (object) animation object, see @Raphael.animation
     **
     = (object) original element
     \*/
    elproto.animate = function (params, ms, easing, callback) {
        var element = this;
        if (element.removed) {
            callback && callback.call(element);
            return element;
        }
        var anim = params instanceof Animation ? params : R.animation(params, ms, easing, callback);
        runAnimation(anim, element, anim.percents[0], null, element.attr());
        return element;
    };
    /*\
     * Element.setTime
     [ method ]
     **
     * Sets the status of animation of the element in milliseconds. Similar to @Element.status method.
     **
     > Parameters
     **
     - anim (object) animation object
     - value (number) number of milliseconds from the beginning of the animation
     **
     = (object) original element if `value` is specified
     * Note, that during animation following events are triggered:
     *
     * On each animation frame event `anim.frame.<id>`, on start `anim.start.<id>` and on end `anim.finish.<id>`.
     \*/
    elproto.setTime = function (anim, value) {
        if (anim && value != null) {
            this.status(anim, mmin(value, anim.ms) / anim.ms);
        }
        return this;
    };
    /*\
     * Element.status
     [ method ]
     **
     * Gets or sets the status of animation of the element.
     **
     > Parameters
     **
     - anim (object) #optional animation object
     - value (number) #optional 0 – 1. If specified, method works like a setter and sets the status of a given animation to the value. This will cause animation to jump to the given position.
     **
     = (number) status
     * or
     = (array) status if `anim` is not specified. Array of objects in format:
     o {
     o     anim: (object) animation object
     o     status: (number) status
     o }
     * or
     = (object) original element if `value` is specified
     \*/
    elproto.status = function (anim, value) {
        var out = [],
            i = 0,
            len,
            e;
        if (value != null) {
            runAnimation(anim, this, -1, mmin(value, 1));
            return this;
        } else {
            len = animationElements.length;
            for (; i < len; i++) {
                e = animationElements[i];
                if (e.el.id == this.id && (!anim || e.anim == anim)) {
                    if (anim) {
                        return e.status;
                    }
                    out.push({
                        anim: e.anim,
                        status: e.status
                    });
                }
            }
            if (anim) {
                return 0;
            }
            return out;
        }
    };
    /*\
     * Element.pause
     [ method ]
     **
     * Stops animation of the element with ability to resume it later on.
     **
     > Parameters
     **
     - anim (object) #optional animation object
     **
     = (object) original element
     \*/
    elproto.pause = function (anim) {
        for (var i = 0; i < animationElements.length; i++) if (animationElements[i].el.id == this.id && (!anim || animationElements[i].anim == anim)) {
            if (eve("raphael.anim.pause." + this.id, this, animationElements[i].anim) !== false) {
                animationElements[i].paused = true;
            }
        }
        return this;
    };
    /*\
     * Element.resume
     [ method ]
     **
     * Resumes animation if it was paused with @Element.pause method.
     **
     > Parameters
     **
     - anim (object) #optional animation object
     **
     = (object) original element
     \*/
    elproto.resume = function (anim) {
        for (var i = 0; i < animationElements.length; i++) if (animationElements[i].el.id == this.id && (!anim || animationElements[i].anim == anim)) {
            var e = animationElements[i];
            if (eve("raphael.anim.resume." + this.id, this, e.anim) !== false) {
                delete e.paused;
                this.status(e.anim, e.status);
            }
        }
        return this;
    };
    /*\
     * Element.stop
     [ method ]
     **
     * Stops animation of the element.
     **
     > Parameters
     **
     - anim (object) #optional animation object
     **
     = (object) original element
     \*/
    elproto.stop = function (anim) {
        for (var i = 0; i < animationElements.length; i++) if (animationElements[i].el.id == this.id && (!anim || animationElements[i].anim == anim)) {
            if (eve("raphael.anim.stop." + this.id, this, animationElements[i].anim) !== false) {
                animationElements.splice(i--, 1);
            }
        }
        return this;
    };
    function stopAnimation(paper) {
        for (var i = 0; i < animationElements.length; i++) if (animationElements[i].el.paper == paper) {
            animationElements.splice(i--, 1);
        }
    }
    eve.on("raphael.remove", stopAnimation);
    eve.on("raphael.clear", stopAnimation);
    elproto.toString = function () {
        return "Rapha\xebl\u2019s object";
    };

    // Set
    var Set = function (items) {
            this.items = [];
            this.length = 0;
            this.type = "set";
            if (items) {
                for (var i = 0, ii = items.length; i < ii; i++) {
                    if (items[i] && (items[i].constructor == elproto.constructor || items[i].constructor == Set)) {
                        this[this.items.length] = this.items[this.items.length] = items[i];
                        this.length++;
                    }
                }
            }
        },
        setproto = Set.prototype;
    /*\
     * Set.push
     [ method ]
     **
     * Adds each argument to the current set.
     = (object) original element
     \*/
    setproto.push = function () {
        var item,
            len;
        for (var i = 0, ii = arguments.length; i < ii; i++) {
            item = arguments[i];
            if (item && (item.constructor == elproto.constructor || item.constructor == Set)) {
                len = this.items.length;
                this[len] = this.items[len] = item;
                this.length++;
            }
        }
        return this;
    };
    /*\
     * Set.pop
     [ method ]
     **
     * Removes last element and returns it.
     = (object) element
     \*/
    setproto.pop = function () {
        this.length && delete this[this.length--];
        return this.items.pop();
    };
    /*\
     * Set.forEach
     [ method ]
     **
     * Executes given function for each element in the set.
     *
     * If function returns `false` it will stop loop running.
     **
     > Parameters
     **
     - callback (function) function to run
     - thisArg (object) context object for the callback
     = (object) Set object
     \*/
    setproto.forEach = function (callback, thisArg) {
        for (var i = 0, ii = this.items.length; i < ii; i++) {
            if (callback.call(thisArg, this.items[i], i) === false) {
                return this;
            }
        }
        return this;
    };
    for (var method in elproto) if (elproto[has](method)) {
        setproto[method] = (function (methodname) {
            return function () {
                var arg = arguments;
                return this.forEach(function (el) {
                    el[methodname][apply](el, arg);
                });
            };
        })(method);
    }
    setproto.attr = function (name, value) {
        if (name && R.is(name, array) && R.is(name[0], "object")) {
            for (var j = 0, jj = name.length; j < jj; j++) {
                this.items[j].attr(name[j]);
            }
        } else {
            for (var i = 0, ii = this.items.length; i < ii; i++) {
                this.items[i].attr(name, value);
            }
        }
        return this;
    };
    /*\
     * Set.clear
     [ method ]
     **
     * Removeds all elements from the set
     \*/
    setproto.clear = function () {
        while (this.length) {
            this.pop();
        }
    };
    /*\
     * Set.splice
     [ method ]
     **
     * Removes given element from the set
     **
     > Parameters
     **
     - index (number) position of the deletion
     - count (number) number of element to remove
     - insertion… (object) #optional elements to insert
     = (object) set elements that were deleted
     \*/
    setproto.splice = function (index, count, insertion) {
        index = index < 0 ? mmax(this.length + index, 0) : index;
        count = mmax(0, mmin(this.length - index, count));
        var tail = [],
            todel = [],
            args = [],
            i;
        for (i = 2; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
        for (i = 0; i < count; i++) {
            todel.push(this[index + i]);
        }
        for (; i < this.length - index; i++) {
            tail.push(this[index + i]);
        }
        var arglen = args.length;
        for (i = 0; i < arglen + tail.length; i++) {
            this.items[index + i] = this[index + i] = i < arglen ? args[i] : tail[i - arglen];
        }
        i = this.items.length = this.length -= count - arglen;
        while (this[i]) {
            delete this[i++];
        }
        return new Set(todel);
    };
    /*\
     * Set.exclude
     [ method ]
     **
     * Removes given element from the set
     **
     > Parameters
     **
     - element (object) element to remove
     = (boolean) `true` if object was found & removed from the set
     \*/
    setproto.exclude = function (el) {
        for (var i = 0, ii = this.length; i < ii; i++) if (this[i] == el) {
            this.splice(i, 1);
            return true;
        }
    };
    setproto.animate = function (params, ms, easing, callback) {
        (R.is(easing, "function") || !easing) && (callback = easing || null);
        var len = this.items.length,
            i = len,
            item,
            set = this,
            collector;
        if (!len) {
            return this;
        }
        callback && (collector = function () {
            !--len && callback.call(set);
        });
        easing = R.is(easing, string) ? easing : collector;
        var anim = R.animation(params, ms, easing, collector);
        item = this.items[--i].animate(anim);
        while (i--) {
            this.items[i] && !this.items[i].removed && this.items[i].animateWith(item, anim, anim);
            (this.items[i] && !this.items[i].removed) || len--;
        }
        return this;
    };
    setproto.insertAfter = function (el) {
        var i = this.items.length;
        while (i--) {
            this.items[i].insertAfter(el);
        }
        return this;
    };
    setproto.getBBox = function () {
        var x = [],
            y = [],
            x2 = [],
            y2 = [];
        for (var i = this.items.length; i--;) if (!this.items[i].removed) {
            var box = this.items[i].getBBox();
            x.push(box.x);
            y.push(box.y);
            x2.push(box.x + box.width);
            y2.push(box.y + box.height);
        }
        x = mmin[apply](0, x);
        y = mmin[apply](0, y);
        x2 = mmax[apply](0, x2);
        y2 = mmax[apply](0, y2);
        return {
            x: x,
            y: y,
            x2: x2,
            y2: y2,
            width: x2 - x,
            height: y2 - y
        };
    };
    setproto.clone = function (s) {
        s = this.paper.set();
        for (var i = 0, ii = this.items.length; i < ii; i++) {
            s.push(this.items[i].clone());
        }
        return s;
    };
    setproto.toString = function () {
        return "Rapha\xebl\u2018s set";
    };

    setproto.glow = function(glowConfig) {
        var ret = this.paper.set();
        this.forEach(function(shape, index){
            var g = shape.glow(glowConfig);
            if(g != null){
                g.forEach(function(shape2, index2){
                    ret.push(shape2);
                });
            }
        });
        return ret;
    };


    /*\
     * Set.isPointInside
     [ method ]
     **
     * Determine if given point is inside this set’s elements
     **
     > Parameters
     **
     - x (number) x coordinate of the point
     - y (number) y coordinate of the point
     = (boolean) `true` if point is inside any of the set's elements
     \*/
    setproto.isPointInside = function (x, y) {
        var isPointInside = false;
        this.forEach(function (el) {
            if (el.isPointInside(x, y)) {
                console.log('runned');
                isPointInside = true;
                return false; // stop loop
            }
        });
        return isPointInside;
    };

    /*\
     * Raphael.registerFont
     [ method ]
     **
     * Adds given font to the registered set of fonts for Raphaël. Should be used as an internal call from within Cufón’s font file.
     * Returns original parameter, so it could be used with chaining.
     # <a href="http://wiki.github.com/sorccu/cufon/about">More about Cufón and how to convert your font form TTF, OTF, etc to JavaScript file.</a>
     **
     > Parameters
     **
     - font (object) the font to register
     = (object) the font you passed in
     > Usage
     | Cufon.registerFont(Raphael.registerFont({…}));
     \*/
    R.registerFont = function (font) {
        if (!font.face) {
            return font;
        }
        this.fonts = this.fonts || {};
        var fontcopy = {
                w: font.w,
                face: {},
                glyphs: {}
            },
            family = font.face["font-family"];
        for (var prop in font.face) if (font.face[has](prop)) {
            fontcopy.face[prop] = font.face[prop];
        }
        if (this.fonts[family]) {
            this.fonts[family].push(fontcopy);
        } else {
            this.fonts[family] = [fontcopy];
        }
        if (!font.svg) {
            fontcopy.face["units-per-em"] = toInt(font.face["units-per-em"], 10);
            for (var glyph in font.glyphs) if (font.glyphs[has](glyph)) {
                var path = font.glyphs[glyph];
                fontcopy.glyphs[glyph] = {
                    w: path.w,
                    k: {},
                    d: path.d && "M" + path.d.replace(/[mlcxtrv]/g, function (command) {
                        return {l: "L", c: "C", x: "z", t: "m", r: "l", v: "c"}[command] || "M";
                    }) + "z"
                };
                if (path.k) {
                    for (var k in path.k) if (path[has](k)) {
                        fontcopy.glyphs[glyph].k[k] = path.k[k];
                    }
                }
            }
        }
        return font;
    };
    /*\
     * Paper.getFont
     [ method ]
     **
     * Finds font object in the registered fonts by given parameters. You could specify only one word from the font name, like “Myriad” for “Myriad Pro”.
     **
     > Parameters
     **
     - family (string) font family name or any word from it
     - weight (string) #optional font weight
     - style (string) #optional font style
     - stretch (string) #optional font stretch
     = (object) the font object
     > Usage
     | paper.print(100, 100, "Test string", paper.getFont("Times", 800), 30);
     \*/
    paperproto.getFont = function (family, weight, style, stretch) {
        stretch = stretch || "normal";
        style = style || "normal";
        weight = +weight || {normal: 400, bold: 700, lighter: 300, bolder: 800}[weight] || 400;
        if (!R.fonts) {
            return;
        }
        var font = R.fonts[family];
        if (!font) {
            var name = new RegExp("(^|\\s)" + family.replace(/[^\w\d\s+!~.:_-]/g, E) + "(\\s|$)", "i");
            for (var fontName in R.fonts) if (R.fonts[has](fontName)) {
                if (name.test(fontName)) {
                    font = R.fonts[fontName];
                    break;
                }
            }
        }
        var thefont;
        if (font) {
            for (var i = 0, ii = font.length; i < ii; i++) {
                thefont = font[i];
                if (thefont.face["font-weight"] == weight && (thefont.face["font-style"] == style || !thefont.face["font-style"]) && thefont.face["font-stretch"] == stretch) {
                    break;
                }
            }
        }
        return thefont;
    };
    /*\
     * Paper.print
     [ method ]
     **
     * Creates path that represent given text written using given font at given position with given size.
     * Result of the method is path element that contains whole text as a separate path.
     **
     > Parameters
     **
     - x (number) x position of the text
     - y (number) y position of the text
     - string (string) text to print
     - font (object) font object, see @Paper.getFont
     - size (number) #optional size of the font, default is `16`
     - origin (string) #optional could be `"baseline"` or `"middle"`, default is `"middle"`
     - letter_spacing (number) #optional number in range `-1..1`, default is `0`
     - line_spacing (number) #optional number in range `1..3`, default is `1`
     = (object) resulting path element, which consist of all letters
     > Usage
     | var txt = r.print(10, 50, "print", r.getFont("Museo"), 30).attr({fill: "#fff"});
     \*/
    paperproto.print = function (x, y, string, font, size, origin, letter_spacing, line_spacing) {
        origin = origin || "middle"; // baseline|middle
        letter_spacing = mmax(mmin(letter_spacing || 0, 1), -1);
        line_spacing = mmax(mmin(line_spacing || 1, 3), 1);
        var letters = Str(string)[split](E),
            shift = 0,
            notfirst = 0,
            path = E,
            scale;
        R.is(font, "string") && (font = this.getFont(font));
        if (font) {
            scale = (size || 16) / font.face["units-per-em"];
            var bb = font.face.bbox[split](separator),
                top = +bb[0],
                lineHeight = bb[3] - bb[1],
                shifty = 0,
                height = +bb[1] + (origin == "baseline" ? lineHeight + (+font.face.descent) : lineHeight / 2);
            for (var i = 0, ii = letters.length; i < ii; i++) {
                if (letters[i] == "\n") {
                    shift = 0;
                    curr = 0;
                    notfirst = 0;
                    shifty += lineHeight * line_spacing;
                } else {
                    var prev = notfirst && font.glyphs[letters[i - 1]] || {},
                        curr = font.glyphs[letters[i]];
                    shift += notfirst ? (prev.w || font.w) + (prev.k && prev.k[letters[i]] || 0) + (font.w * letter_spacing) : 0;
                    notfirst = 1;
                }
                if (curr && curr.d) {
                    path += R.transformPath(curr.d, ["t", shift * scale, shifty * scale, "s", scale, scale, top, height, "t", (x - top) / scale, (y - height) / scale]);
                }
            }
        }
        return this.path(path).attr({
            fill: "#000",
            stroke: "none"
        });
    };

    /*\
     * Paper.add
     [ method ]
     **
     * Imports elements in JSON array in format `{type: type, <attributes>}`
     **
     > Parameters
     **
     - json (array)
     = (object) resulting set of imported elements
     > Usage
     | paper.add([
     |     {
     |         type: "circle",
     |         cx: 10,
     |         cy: 10,
     |         r: 5
     |     },
     |     {
     |         type: "rect",
     |         x: 10,
     |         y: 10,
     |         width: 10,
     |         height: 10,
     |         fill: "#fc0"
     |     }
     | ]);
     \*/
    paperproto.add = function (json) {
        if (R.is(json, "array")) {
            var res = this.set(),
                i = 0,
                ii = json.length,
                j;
            for (; i < ii; i++) {
                j = json[i] || {};
                elements[has](j.type) && res.push(this[j.type]().attr(j));
            }
        }
        return res;
    };

    /*\
     * Raphael.format
     [ method ]
     **
     * Simple format function. Replaces construction of type “`{<number>}`” to the corresponding argument.
     **
     > Parameters
     **
     - token (string) string to format
     - … (string) rest of arguments will be treated as parameters for replacement
     = (string) formated string
     > Usage
     | var x = 10,
     |     y = 20,
     |     width = 40,
     |     height = 50;
     | // this will draw a rectangular shape equivalent to "M10,20h40v50h-40z"
     | paper.path(Raphael.format("M{0},{1}h{2}v{3}h{4}z", x, y, width, height, -width));
     \*/
    R.format = function (token, params) {
        var args = R.is(params, array) ? [0][concat](params) : arguments;
        token && R.is(token, string) && args.length - 1 && (token = token.replace(formatrg, function (str, i) {
            return args[++i] == null ? E : args[i];
        }));
        return token || E;
    };
    /*\
     * Raphael.fullfill
     [ method ]
     **
     * A little bit more advanced format function than @Raphael.format. Replaces construction of type “`{<name>}`” to the corresponding argument.
     **
     > Parameters
     **
     - token (string) string to format
     - json (object) object which properties will be used as a replacement
     = (string) formated string
     > Usage
     | // this will draw a rectangular shape equivalent to "M10,20h40v50h-40z"
     | paper.path(Raphael.fullfill("M{x},{y}h{dim.width}v{dim.height}h{dim['negative width']}z", {
     |     x: 10,
     |     y: 20,
     |     dim: {
     |         width: 40,
     |         height: 50,
     |         "negative width": -40
     |     }
     | }));
     \*/
    R.fullfill = (function () {
        var tokenRegex = /\{([^\}]+)\}/g,
            objNotationRegex = /(?:(?:^|\.)(.+?)(?=\[|\.|$|\()|\[('|")(.+?)\2\])(\(\))?/g, // matches .xxxxx or ["xxxxx"] to run over object properties
            replacer = function (all, key, obj) {
                var res = obj;
                key.replace(objNotationRegex, function (all, name, quote, quotedName, isFunc) {
                    name = name || quotedName;
                    if (res) {
                        if (name in res) {
                            res = res[name];
                        }
                        typeof res == "function" && isFunc && (res = res());
                    }
                });
                res = (res == null || res == obj ? all : res) + "";
                return res;
            };
        return function (str, obj) {
            return String(str).replace(tokenRegex, function (all, key) {
                return replacer(all, key, obj);
            });
        };
    })();
    /*\
     * Raphael.ninja
     [ method ]
     **
     * If you want to leave no trace of Raphaël (Well, Raphaël creates only one global variable `Raphael`, but anyway.) You can use `ninja` method.
     * Beware, that in this case plugins could stop working, because they are depending on global variable existance.
     **
     = (object) Raphael object
     > Usage
     | (function (local_raphael) {
     |     var paper = local_raphael(10, 10, 320, 200);
     |     …
     | })(Raphael.ninja());
     \*/
    R.ninja = function () {
        oldRaphael.was ? (g.win.Raphael = oldRaphael.is) : delete Raphael;
        return R;
    };
    /*\
     * Raphael.st
     [ property (object) ]
     **
     * You can add your own method to elements and sets. It is wise to add a set method for each element method
     * you added, so you will be able to call the same method on sets too.
     **
     * See also @Raphael.el.
     > Usage
     | Raphael.el.red = function () {
     |     this.attr({fill: "#f00"});
     | };
     | Raphael.st.red = function () {
     |     this.forEach(function (el) {
     |         el.red();
     |     });
     | };
     | // then use it
     | paper.set(paper.circle(100, 100, 20), paper.circle(110, 100, 20)).red();
     \*/
    R.st = setproto;
    // Firefox <3.6 fix: http://webreflection.blogspot.com/2009/11/195-chars-to-help-lazy-loading.html
    (function (doc, loaded, f) {
        if (doc.readyState == null && doc.addEventListener){
            doc.addEventListener(loaded, f = function () {
                doc.removeEventListener(loaded, f, false);
                doc.readyState = "complete";
            }, false);
            doc.readyState = "loading";
        }
        function isLoaded() {
            (/in/).test(doc.readyState) ? setTimeout(isLoaded, 9) : R.eve("raphael.DOMload");
        }
        isLoaded();
    })(document, "DOMContentLoaded");

    eve.on("raphael.DOMload", function () {
        loaded = true;
    });

// ┌─────────────────────────────────────────────────────────────────────┐ \\
// │ Raphaël - JavaScript Vector Library                                 │ \\
// ├─────────────────────────────────────────────────────────────────────┤ \\
// │ SVG Module                                                          │ \\
// ├─────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright (c) 2008-2011 Dmitry Baranovskiy (http://raphaeljs.com)   │ \\
// │ Copyright (c) 2008-2011 Sencha Labs (http://sencha.com)             │ \\
// │ Licensed under the MIT (http://raphaeljs.com/license.html) license. │ \\
// └─────────────────────────────────────────────────────────────────────┘ \\

    (function(){
        if (!R.svg) {
            return;
        }
        var has = "hasOwnProperty",
            Str = String,
            toFloat = parseFloat,
            toInt = parseInt,
            math = Math,
            mmax = math.max,
            abs = math.abs,
            pow = math.pow,
            separator = /[, ]+/,
            eve = R.eve,
            E = "",
            S = " ";
        var xlink = "http://www.w3.org/1999/xlink",
            markers = {
                block: "M5,0 0,2.5 5,5z",
                classic: "M5,0 0,2.5 5,5 3.5,3 3.5,2z",
                diamond: "M2.5,0 5,2.5 2.5,5 0,2.5z",
                open: "M6,1 1,3.5 6,6",
                oval: "M2.5,0A2.5,2.5,0,0,1,2.5,5 2.5,2.5,0,0,1,2.5,0z"
            },
            markerCounter = {};
        R.toString = function () {
            return  "Your browser supports SVG.\nYou are running Rapha\xebl " + this.version;
        };
        var $ = function (el, attr) {
                if (attr) {
                    if (typeof el == "string") {
                        el = $(el);
                    }
                    for (var key in attr) if (attr[has](key)) {
                        if (key.substring(0, 6) == "xlink:") {
                            el.setAttributeNS(xlink, key.substring(6), Str(attr[key]));
                        } else {
                            el.setAttribute(key, Str(attr[key]));
                        }
                    }
                } else {
                    el = R._g.doc.createElementNS("http://www.w3.org/2000/svg", el);
                    el.style && (el.style.webkitTapHighlightColor = "rgba(0,0,0,0)");
                }
                return el;
            },
            addGradientFill = function (element, gradient) {
                var type = "linear",
                    id = element.id + gradient,
                    fx = .5, fy = .5,
                    o = element.node,
                    SVG = element.paper,
                    s = o.style,
                    el = R._g.doc.getElementById(id);
                if (!el) {
                    gradient = Str(gradient).replace(R._radial_gradient, function (all, _fx, _fy) {
                        type = "radial";
                        if (_fx && _fy) {
                            fx = toFloat(_fx);
                            fy = toFloat(_fy);
                            var dir = ((fy > .5) * 2 - 1);
                            pow(fx - .5, 2) + pow(fy - .5, 2) > .25 &&
                            (fy = math.sqrt(.25 - pow(fx - .5, 2)) * dir + .5) &&
                            fy != .5 &&
                            (fy = fy.toFixed(5) - 1e-5 * dir);
                        }
                        return E;
                    });
                    gradient = gradient.split(/\s*\-\s*/);
                    if (type == "linear") {
                        var angle = gradient.shift();
                        angle = -toFloat(angle);
                        if (isNaN(angle)) {
                            return null;
                        }
                        var vector = [0, 0, math.cos(R.rad(angle)), math.sin(R.rad(angle))],
                            max = 1 / (mmax(abs(vector[2]), abs(vector[3])) || 1);
                        vector[2] *= max;
                        vector[3] *= max;
                        if (vector[2] < 0) {
                            vector[0] = -vector[2];
                            vector[2] = 0;
                        }
                        if (vector[3] < 0) {
                            vector[1] = -vector[3];
                            vector[3] = 0;
                        }
                    }
                    var dots = R._parseDots(gradient);
                    if (!dots) {
                        return null;
                    }
                    id = id.replace(/[\(\)\s,\xb0#]/g, "_");

                    if (element.gradient && id != element.gradient.id) {
                        SVG.defs.removeChild(element.gradient);
                        delete element.gradient;
                    }

                    if (!element.gradient) {
                        el = $(type + "Gradient", {id: id});
                        element.gradient = el;
                        $(el, type == "radial" ? {
                            fx: fx,
                            fy: fy
                        } : {
                            x1: vector[0],
                            y1: vector[1],
                            x2: vector[2],
                            y2: vector[3],
                            gradientTransform: element.matrix.invert()
                        });
                        SVG.defs.appendChild(el);
                        for (var i = 0, ii = dots.length; i < ii; i++) {
                            el.appendChild($("stop", {
                                offset: dots[i].offset ? dots[i].offset : i ? "100%" : "0%",
                                "stop-color": dots[i].color || "#fff"
                            }));
                        }
                    }
                }
                $(o, {
                    fill: "url(#" + id + ")",
                    opacity: 1,
                    "fill-opacity": 1
                });
                s.fill = E;
                s.opacity = 1;
                s.fillOpacity = 1;
                return 1;
            },
            updatePosition = function (o) {
                var bbox = o.getBBox(1);
                $(o.pattern, {patternTransform: o.matrix.invert() + " translate(" + bbox.x + "," + bbox.y + ")"});
            },
            addArrow = function (o, value, isEnd) {
                if (o.type == "path") {
                    var values = Str(value).toLowerCase().split("-"),
                        p = o.paper,
                        se = isEnd ? "end" : "start",
                        node = o.node,
                        attrs = o.attrs,
                        stroke = attrs["stroke-width"],
                        i = values.length,
                        type = "classic",
                        from,
                        to,
                        dx,
                        refX,
                        attr,
                        w = 3,
                        h = 3,
                        t = 5;
                    while (i--) {
                        switch (values[i]) {
                            case "block":
                            case "classic":
                            case "oval":
                            case "diamond":
                            case "open":
                            case "none":
                                type = values[i];
                                break;
                            case "wide": h = 5; break;
                            case "narrow": h = 2; break;
                            case "long": w = 5; break;
                            case "short": w = 2; break;
                        }
                    }
                    if (type == "open") {
                        w += 2;
                        h += 2;
                        t += 2;
                        dx = 1;
                        refX = isEnd ? 4 : 1;
                        attr = {
                            fill: "none",
                            stroke: attrs.stroke
                        };
                    } else {
                        refX = dx = w / 2;
                        attr = {
                            fill: attrs.stroke,
                            stroke: "none"
                        };
                    }
                    if (o._.arrows) {
                        if (isEnd) {
                            o._.arrows.endPath && markerCounter[o._.arrows.endPath]--;
                            o._.arrows.endMarker && markerCounter[o._.arrows.endMarker]--;
                        } else {
                            o._.arrows.startPath && markerCounter[o._.arrows.startPath]--;
                            o._.arrows.startMarker && markerCounter[o._.arrows.startMarker]--;
                        }
                    } else {
                        o._.arrows = {};
                    }
                    if (type != "none") {
                        var pathId = "raphael-marker-" + type,
                            markerId = "raphael-marker-" + se + type + w + h;
                        if (!R._g.doc.getElementById(pathId)) {
                            p.defs.appendChild($($("path"), {
                                "stroke-linecap": "round",
                                d: markers[type],
                                id: pathId
                            }));
                            markerCounter[pathId] = 1;
                        } else {
                            markerCounter[pathId]++;
                        }
                        var marker = R._g.doc.getElementById(markerId),
                            use;
                        if (!marker) {
                            marker = $($("marker"), {
                                id: markerId,
                                markerHeight: h,
                                markerWidth: w,
                                orient: "auto",
                                refX: refX,
                                refY: h / 2
                            });
                            use = $($("use"), {
                                "xlink:href": "#" + pathId,
                                transform: (isEnd ? "rotate(180 " + w / 2 + " " + h / 2 + ") " : E) + "scale(" + w / t + "," + h / t + ")",
                                "stroke-width": (1 / ((w / t + h / t) / 2)).toFixed(4)
                            });
                            marker.appendChild(use);
                            p.defs.appendChild(marker);
                            markerCounter[markerId] = 1;
                        } else {
                            markerCounter[markerId]++;
                            use = marker.getElementsByTagName("use")[0];
                        }
                        $(use, attr);
                        var delta = dx * (type != "diamond" && type != "oval");
                        if (isEnd) {
                            from = o._.arrows.startdx * stroke || 0;
                            to = R.getTotalLength(attrs.path) - delta * stroke;
                        } else {
                            from = delta * stroke;
                            to = R.getTotalLength(attrs.path) - (o._.arrows.enddx * stroke || 0);
                        }
                        attr = {};
                        attr["marker-" + se] = "url(#" + markerId + ")";
                        if (to || from) {
                            attr.d = R.getSubpath(attrs.path, from, to);
                        }
                        $(node, attr);
                        o._.arrows[se + "Path"] = pathId;
                        o._.arrows[se + "Marker"] = markerId;
                        o._.arrows[se + "dx"] = delta;
                        o._.arrows[se + "Type"] = type;
                        o._.arrows[se + "String"] = value;
                    } else {
                        if (isEnd) {
                            from = o._.arrows.startdx * stroke || 0;
                            to = R.getTotalLength(attrs.path) - from;
                        } else {
                            from = 0;
                            to = R.getTotalLength(attrs.path) - (o._.arrows.enddx * stroke || 0);
                        }
                        o._.arrows[se + "Path"] && $(node, {d: R.getSubpath(attrs.path, from, to)});
                        delete o._.arrows[se + "Path"];
                        delete o._.arrows[se + "Marker"];
                        delete o._.arrows[se + "dx"];
                        delete o._.arrows[se + "Type"];
                        delete o._.arrows[se + "String"];
                    }
                    for (attr in markerCounter) if (markerCounter[has](attr) && !markerCounter[attr]) {
                        var item = R._g.doc.getElementById(attr);
                        item && item.parentNode.removeChild(item);
                    }
                }
            },
            dasharray = {
                "": [0],
                "none": [0],
                "-": [3, 1],
                ".": [1, 1],
                "-.": [3, 1, 1, 1],
                "-..": [3, 1, 1, 1, 1, 1],
                ". ": [1, 3],
                "- ": [4, 3],
                "--": [8, 3],
                "- .": [4, 3, 1, 3],
                "--.": [8, 3, 1, 3],
                "--..": [8, 3, 1, 3, 1, 3]
            },
            addDashes = function (o, value, params) {
                value = dasharray[Str(value).toLowerCase()];
                if (value) {
                    var width = o.attrs["stroke-width"] || "1",
                        butt = {round: width, square: width, butt: 0}[o.attrs["stroke-linecap"] || params["stroke-linecap"]] || 0,
                        dashes = [],
                        i = value.length;
                    while (i--) {
                        dashes[i] = value[i] * width + ((i % 2) ? 1 : -1) * butt;
                    }
                    $(o.node, {"stroke-dasharray": dashes.join(",")});
                }
            },
            setFillAndStroke = function (o, params) {
                var node = o.node,
                    attrs = o.attrs,
                    vis = node.style.visibility;
                node.style.visibility = "hidden";
                for (var att in params) {
                    if (params[has](att)) {
                        if (!R._availableAttrs[has](att)) {
                            continue;
                        }
                        var value = params[att];
                        attrs[att] = value;
                        switch (att) {
                            case "blur":
                                o.blur(value);
                                break;
                            case "href":
                            case "title":
                            case "target":
                                var pn = node.parentNode;
                                if (pn.tagName.toLowerCase() != "a") {
                                    var hl = $("a");
                                    pn.insertBefore(hl, node);
                                    hl.appendChild(node);
                                    pn = hl;
                                }
                                if (att == "target") {
                                    pn.setAttributeNS(xlink, "show", value == "blank" ? "new" : value);
                                } else {
                                    pn.setAttributeNS(xlink, att, value);
                                }
                                break;
                            case "cursor":
                                node.style.cursor = value;
                                break;
                            case "transform":
                                o.transform(value);
                                break;
                            case "arrow-start":
                                addArrow(o, value);
                                break;
                            case "arrow-end":
                                addArrow(o, value, 1);
                                break;
                            case "clip-rect":
                                var rect = Str(value).split(separator);
                                if (rect.length == 4) {
                                    o.clip && o.clip.parentNode.parentNode.removeChild(o.clip.parentNode);
                                    var el = $("clipPath"),
                                        rc = $("rect");
                                    el.id = R.createUUID();
                                    $(rc, {
                                        x: rect[0],
                                        y: rect[1],
                                        width: rect[2],
                                        height: rect[3]
                                    });
                                    el.appendChild(rc);
                                    o.paper.defs.appendChild(el);
                                    $(node, {"clip-path": "url(#" + el.id + ")"});
                                    o.clip = rc;
                                }
                                if (!value) {
                                    var path = node.getAttribute("clip-path");
                                    if (path) {
                                        var clip = R._g.doc.getElementById(path.replace(/(^url\(#|\)$)/g, E));
                                        clip && clip.parentNode.removeChild(clip);
                                        $(node, {"clip-path": E});
                                        delete o.clip;
                                    }
                                }
                                break;
                            case "path":
                                if (o.type == "path") {
                                    $(node, {d: value ? attrs.path = R._pathToAbsolute(value) : "M0,0"});
                                    o._.dirty = 1;
                                    if (o._.arrows) {
                                        "startString" in o._.arrows && addArrow(o, o._.arrows.startString);
                                        "endString" in o._.arrows && addArrow(o, o._.arrows.endString, 1);
                                    }
                                }
                                break;
                            case "width":
                                node.setAttribute(att, value);
                                o._.dirty = 1;
                                if (attrs.fx) {
                                    att = "x";
                                    value = attrs.x;
                                } else {
                                    break;
                                }
                            case "x":
                                if (attrs.fx) {
                                    value = -attrs.x - (attrs.width || 0);
                                }
                            case "rx":
                                if (att == "rx" && o.type == "rect") {
                                    break;
                                }
                            case "cx":
                                node.setAttribute(att, value);
                                o.pattern && updatePosition(o);
                                o._.dirty = 1;
                                break;
                            case "height":
                                node.setAttribute(att, value);
                                o._.dirty = 1;
                                if (attrs.fy) {
                                    att = "y";
                                    value = attrs.y;
                                } else {
                                    break;
                                }
                            case "y":
                                if (attrs.fy) {
                                    value = -attrs.y - (attrs.height || 0);
                                }
                            case "ry":
                                if (att == "ry" && o.type == "rect") {
                                    break;
                                }
                            case "cy":
                                node.setAttribute(att, value);
                                o.pattern && updatePosition(o);
                                o._.dirty = 1;
                                break;
                            case "r":
                                if (o.type == "rect") {
                                    $(node, {rx: value, ry: value});
                                } else {
                                    node.setAttribute(att, value);
                                }
                                o._.dirty = 1;
                                break;
                            case "src":
                                if (o.type == "image") {
                                    node.setAttributeNS(xlink, "href", value);
                                }
                                break;
                            case "stroke-width":
                                if (o._.sx != 1 || o._.sy != 1) {
                                    value /= mmax(abs(o._.sx), abs(o._.sy)) || 1;
                                }
                                if (o.paper._vbSize) {
                                    value *= o.paper._vbSize;
                                }
                                node.setAttribute(att, value);
                                if (attrs["stroke-dasharray"]) {
                                    addDashes(o, attrs["stroke-dasharray"], params);
                                }
                                if (o._.arrows) {
                                    "startString" in o._.arrows && addArrow(o, o._.arrows.startString);
                                    "endString" in o._.arrows && addArrow(o, o._.arrows.endString, 1);
                                }
                                break;
                            case "stroke-dasharray":
                                addDashes(o, value, params);
                                break;
                            case "fill":
                                var isURL = Str(value).match(R._ISURL);
                                if (isURL) {
                                    el = $("pattern");
                                    var ig = $("image");
                                    el.id = R.createUUID();
                                    $(el, {x: 0, y: 0, patternUnits: "userSpaceOnUse", height: 1, width: 1});
                                    $(ig, {x: 0, y: 0, "xlink:href": isURL[1]});
                                    el.appendChild(ig);

                                    (function (el) {
                                        R._preload(isURL[1], function () {
                                            var w = this.offsetWidth,
                                                h = this.offsetHeight;
                                            $(el, {width: w, height: h});
                                            $(ig, {width: w, height: h});
                                            o.paper.safari();
                                        });
                                    })(el);
                                    o.paper.defs.appendChild(el);
                                    $(node, {fill: "url(#" + el.id + ")"});
                                    o.pattern = el;
                                    o.pattern && updatePosition(o);
                                    break;
                                }
                                var clr = R.getRGB(value);
                                if (!clr.error) {
                                    delete params.gradient;
                                    delete attrs.gradient;
                                    !R.is(attrs.opacity, "undefined") &&
                                    R.is(params.opacity, "undefined") &&
                                    $(node, {opacity: attrs.opacity});
                                    !R.is(attrs["fill-opacity"], "undefined") &&
                                    R.is(params["fill-opacity"], "undefined") &&
                                    $(node, {"fill-opacity": attrs["fill-opacity"]});
                                } else if ((o.type == "circle" || o.type == "ellipse" || Str(value).charAt() != "r") && addGradientFill(o, value)) {
                                    if ("opacity" in attrs || "fill-opacity" in attrs) {
                                        var gradient = R._g.doc.getElementById(node.getAttribute("fill").replace(/^url\(#|\)$/g, E));
                                        if (gradient) {
                                            var stops = gradient.getElementsByTagName("stop");
                                            $(stops[stops.length - 1], {"stop-opacity": ("opacity" in attrs ? attrs.opacity : 1) * ("fill-opacity" in attrs ? attrs["fill-opacity"] : 1)});
                                        }
                                    }
                                    attrs.gradient = value;
                                    attrs.fill = "none";
                                    break;
                                }
                                clr[has]("opacity") && $(node, {"fill-opacity": clr.opacity > 1 ? clr.opacity / 100 : clr.opacity});
                            case "stroke":
                                clr = R.getRGB(value);
                                node.setAttribute(att, clr.hex);
                                att == "stroke" && clr[has]("opacity") && $(node, {"stroke-opacity": clr.opacity > 1 ? clr.opacity / 100 : clr.opacity});
                                if (att == "stroke" && o._.arrows) {
                                    "startString" in o._.arrows && addArrow(o, o._.arrows.startString);
                                    "endString" in o._.arrows && addArrow(o, o._.arrows.endString, 1);
                                }
                                break;
                            case "gradient":
                                (o.type == "circle" || o.type == "ellipse" || Str(value).charAt() != "r") && addGradientFill(o, value);
                                break;
                            case "opacity":
                                if (attrs.gradient && !attrs[has]("stroke-opacity")) {
                                    $(node, {"stroke-opacity": value > 1 ? value / 100 : value});
                                }
                            // fall
                            case "fill-opacity":
                                if (attrs.gradient) {
                                    gradient = R._g.doc.getElementById(node.getAttribute("fill").replace(/^url\(#|\)$/g, E));
                                    if (gradient) {
                                        stops = gradient.getElementsByTagName("stop");
                                        $(stops[stops.length - 1], {"stop-opacity": value});
                                    }
                                    break;
                                }
                            default:
                                att == "font-size" && (value = toInt(value, 10) + "px");
                                var cssrule = att.replace(/(\-.)/g, function (w) {
                                    return w.substring(1).toUpperCase();
                                });
                                node.style[cssrule] = value;
                                o._.dirty = 1;
                                node.setAttribute(att, value);
                                break;
                        }
                    }
                }

                tuneText(o, params);
                node.style.visibility = vis;
            },
            leading = 1.2,
            tuneText = function (el, params) {
                if (el.type != "text" || !(params[has]("text") || params[has]("font") || params[has]("font-size") || params[has]("x") || params[has]("y"))) {
                    return;
                }
                var a = el.attrs,
                    node = el.node,
                    fontSize = node.firstChild ? toInt(R._g.doc.defaultView.getComputedStyle(node.firstChild, E).getPropertyValue("font-size"), 10) : 10;

                if (params[has]("text")) {
                    a.text = params.text;
                    while (node.firstChild) {
                        node.removeChild(node.firstChild);
                    }
                    var texts = Str(params.text).split("\n"),
                        tspans = [],
                        tspan;
                    for (var i = 0, ii = texts.length; i < ii; i++) {
                        tspan = $("tspan");
                        i && $(tspan, {dy: fontSize * leading, x: a.x});
                        tspan.appendChild(R._g.doc.createTextNode(texts[i]));
                        node.appendChild(tspan);
                        tspans[i] = tspan;
                    }
                } else {
                    tspans = node.getElementsByTagName("tspan");
                    for (i = 0, ii = tspans.length; i < ii; i++) if (i) {
                        $(tspans[i], {dy: fontSize * leading, x: a.x});
                    } else {
                        $(tspans[0], {dy: 0});
                    }
                }
                $(node, {x: a.x, y: a.y});
                el._.dirty = 1;
                var bb = el._getBBox(),
                    dif = a.y - (bb.y + bb.height / 2);
                dif && R.is(dif, "finite") && $(tspans[0], {dy: dif});
            },
            Element = function (node, svg) {
                var X = 0,
                    Y = 0;
                /*\
                 * Element.node
                 [ property (object) ]
                 **
                 * Gives you a reference to the DOM object, so you can assign event handlers or just mess around.
                 **
                 * Note: Don’t mess with it.
                 > Usage
                 | // draw a circle at coordinate 10,10 with radius of 10
                 | var c = paper.circle(10, 10, 10);
                 | c.node.onclick = function () {
                 |     c.attr("fill", "red");
                 | };
                 \*/
                this[0] = this.node = node;
                /*\
                 * Element.raphael
                 [ property (object) ]
                 **
                 * Internal reference to @Raphael object. In case it is not available.
                 > Usage
                 | Raphael.el.red = function () {
                 |     var hsb = this.paper.raphael.rgb2hsb(this.attr("fill"));
                 |     hsb.h = 1;
                 |     this.attr({fill: this.paper.raphael.hsb2rgb(hsb).hex});
                 | }
                 \*/
                node.raphael = true;
                /*\
                 * Element.id
                 [ property (number) ]
                 **
                 * Unique id of the element. Especially usesful when you want to listen to events of the element,
                 * because all events are fired in format `<module>.<action>.<id>`. Also useful for @Paper.getById method.
                 \*/
                this.id = R._oid++;
                node.raphaelid = this.id;
                this.matrix = R.matrix();
                this.realPath = null;
                /*\
                 * Element.paper
                 [ property (object) ]
                 **
                 * Internal reference to “paper” where object drawn. Mainly for use in plugins and element extensions.
                 > Usage
                 | Raphael.el.cross = function () {
                 |     this.attr({fill: "red"});
                 |     this.paper.path("M10,10L50,50M50,10L10,50")
                 |         .attr({stroke: "red"});
                 | }
                 \*/
                this.paper = svg;
                this.attrs = this.attrs || {};
                this._ = {
                    transform: [],
                    sx: 1,
                    sy: 1,
                    deg: 0,
                    dx: 0,
                    dy: 0,
                    dirty: 1
                };
                !svg.bottom && (svg.bottom = this);
                /*\
                 * Element.prev
                 [ property (object) ]
                 **
                 * Reference to the previous element in the hierarchy.
                 \*/
                this.prev = svg.top;
                svg.top && (svg.top.next = this);
                svg.top = this;
                /*\
                 * Element.next
                 [ property (object) ]
                 **
                 * Reference to the next element in the hierarchy.
                 \*/
                this.next = null;
            },
            elproto = R.el;

        Element.prototype = elproto;
        elproto.constructor = Element;

        R._engine.path = function (pathString, SVG) {
            var el = $("path");
            SVG.canvas && SVG.canvas.appendChild(el);
            var p = new Element(el, SVG);
            p.type = "path";
            setFillAndStroke(p, {
                fill: "none",
                stroke: "#000",
                path: pathString
            });
            return p;
        };
        /*\
         * Element.rotate
         [ method ]
         **
         * Deprecated! Use @Element.transform instead.
         * Adds rotation by given angle around given point to the list of
         * transformations of the element.
         > Parameters
         - deg (number) angle in degrees
         - cx (number) #optional x coordinate of the centre of rotation
         - cy (number) #optional y coordinate of the centre of rotation
         * If cx & cy aren’t specified centre of the shape is used as a point of rotation.
         = (object) @Element
         \*/
        elproto.rotate = function (deg, cx, cy) {
            if (this.removed) {
                return this;
            }
            deg = Str(deg).split(separator);
            if (deg.length - 1) {
                cx = toFloat(deg[1]);
                cy = toFloat(deg[2]);
            }
            deg = toFloat(deg[0]);
            (cy == null) && (cx = cy);
            if (cx == null || cy == null) {
                var bbox = this.getBBox(1);
                cx = bbox.x + bbox.width / 2;
                cy = bbox.y + bbox.height / 2;
            }
            this.transform(this._.transform.concat([["r", deg, cx, cy]]));
            return this;
        };
        /*\
         * Element.scale
         [ method ]
         **
         * Deprecated! Use @Element.transform instead.
         * Adds scale by given amount relative to given point to the list of
         * transformations of the element.
         > Parameters
         - sx (number) horisontal scale amount
         - sy (number) vertical scale amount
         - cx (number) #optional x coordinate of the centre of scale
         - cy (number) #optional y coordinate of the centre of scale
         * If cx & cy aren’t specified centre of the shape is used instead.
         = (object) @Element
         \*/
        elproto.scale = function (sx, sy, cx, cy) {
            if (this.removed) {
                return this;
            }
            sx = Str(sx).split(separator);
            if (sx.length - 1) {
                sy = toFloat(sx[1]);
                cx = toFloat(sx[2]);
                cy = toFloat(sx[3]);
            }
            sx = toFloat(sx[0]);
            (sy == null) && (sy = sx);
            (cy == null) && (cx = cy);
            if (cx == null || cy == null) {
                var bbox = this.getBBox(1);
            }
            cx = cx == null ? bbox.x + bbox.width / 2 : cx;
            cy = cy == null ? bbox.y + bbox.height / 2 : cy;
            this.transform(this._.transform.concat([["s", sx, sy, cx, cy]]));
            return this;
        };
        /*\
         * Element.translate
         [ method ]
         **
         * Deprecated! Use @Element.transform instead.
         * Adds translation by given amount to the list of transformations of the element.
         > Parameters
         - dx (number) horisontal shift
         - dy (number) vertical shift
         = (object) @Element
         \*/
        elproto.translate = function (dx, dy) {
            if (this.removed) {
                return this;
            }
            dx = Str(dx).split(separator);
            if (dx.length - 1) {
                dy = toFloat(dx[1]);
            }
            dx = toFloat(dx[0]) || 0;
            dy = +dy || 0;
            this.transform(this._.transform.concat([["t", dx, dy]]));
            return this;
        };
        /*\
         * Element.transform
         [ method ]
         **
         * Adds transformation to the element which is separate to other attributes,
         * i.e. translation doesn’t change `x` or `y` of the rectange. The format
         * of transformation string is similar to the path string syntax:
         | "t100,100r30,100,100s2,2,100,100r45s1.5"
         * Each letter is a command. There are four commands: `t` is for translate, `r` is for rotate, `s` is for
         * scale and `m` is for matrix.
         *
         * There are also alternative “absolute” translation, rotation and scale: `T`, `R` and `S`. They will not take previous transformation into account. For example, `...T100,0` will always move element 100 px horisontally, while `...t100,0` could move it vertically if there is `r90` before. Just compare results of `r90t100,0` and `r90T100,0`.
         *
         * So, the example line above could be read like “translate by 100, 100; rotate 30° around 100, 100; scale twice around 100, 100;
         * rotate 45° around centre; scale 1.5 times relative to centre”. As you can see rotate and scale commands have origin
         * coordinates as optional parameters, the default is the centre point of the element.
         * Matrix accepts six parameters.
         > Usage
         | var el = paper.rect(10, 20, 300, 200);
         | // translate 100, 100, rotate 45°, translate -100, 0
         | el.transform("t100,100r45t-100,0");
         | // if you want you can append or prepend transformations
         | el.transform("...t50,50");
         | el.transform("s2...");
         | // or even wrap
         | el.transform("t50,50...t-50-50");
         | // to reset transformation call method with empty string
         | el.transform("");
         | // to get current value call it without parameters
         | console.log(el.transform());
         > Parameters
         - tstr (string) #optional transformation string
         * If tstr isn’t specified
         = (string) current transformation string
         * else
         = (object) @Element
         \*/
        elproto.transform = function (tstr) {
            var _ = this._;
            if (tstr == null) {
                return _.transform;
            }
            R._extractTransform(this, tstr);

            this.clip && $(this.clip, {transform: this.matrix.invert()});
            this.pattern && updatePosition(this);
            this.node && $(this.node, {transform: this.matrix});

            if (_.sx != 1 || _.sy != 1) {
                var sw = this.attrs[has]("stroke-width") ? this.attrs["stroke-width"] : 1;
                this.attr({"stroke-width": sw});
            }

            return this;
        };
        /*\
         * Element.hide
         [ method ]
         **
         * Makes element invisible. See @Element.show.
         = (object) @Element
         \*/
        elproto.hide = function () {
            !this.removed && this.paper.safari(this.node.style.display = "none");
            return this;
        };
        /*\
         * Element.show
         [ method ]
         **
         * Makes element visible. See @Element.hide.
         = (object) @Element
         \*/
        elproto.show = function () {
            !this.removed && this.paper.safari(this.node.style.display = "");
            return this;
        };
        /*\
         * Element.remove
         [ method ]
         **
         * Removes element from the paper.
         \*/
        elproto.remove = function () {
            if (this.removed || !this.node.parentNode) {
                return;
            }
            var paper = this.paper;
            paper.__set__ && paper.__set__.exclude(this);
            eve.unbind("raphael.*.*." + this.id);
            if (this.gradient) {
                paper.defs.removeChild(this.gradient);
            }
            R._tear(this, paper);
            if (this.node.parentNode.tagName.toLowerCase() == "a") {
                this.node.parentNode.parentNode.removeChild(this.node.parentNode);
            } else {
                this.node.parentNode.removeChild(this.node);
            }
            for (var i in this) {
                this[i] = typeof this[i] == "function" ? R._removedFactory(i) : null;
            }
            this.removed = true;
        };
        elproto._getBBox = function () {
            if (this.node.style.display == "none") {
                this.show();
                var hide = true;
            }
            var bbox = {};
            try {
                bbox = this.node.getBBox();
            } catch(e) {
                // Firefox 3.0.x plays badly here
            } finally {
                bbox = bbox || {};
            }
            hide && this.hide();
            return bbox;
        };
        /*\
         * Element.attr
         [ method ]
         **
         * Sets the attributes of the element.
         > Parameters
         - attrName (string) attribute’s name
         - value (string) value
         * or
         - params (object) object of name/value pairs
         * or
         - attrName (string) attribute’s name
         * or
         - attrNames (array) in this case method returns array of current values for given attribute names
         = (object) @Element if attrsName & value or params are passed in.
         = (...) value of the attribute if only attrsName is passed in.
         = (array) array of values of the attribute if attrsNames is passed in.
         = (object) object of attributes if nothing is passed in.
         > Possible parameters
         # <p>Please refer to the <a href="http://www.w3.org/TR/SVG/" title="The W3C Recommendation for the SVG language describes these properties in detail.">SVG specification</a> for an explanation of these parameters.</p>
         o arrow-end (string) arrowhead on the end of the path. The format for string is `<type>[-<width>[-<length>]]`. Possible types: `classic`, `block`, `open`, `oval`, `diamond`, `none`, width: `wide`, `narrow`, `medium`, length: `long`, `short`, `midium`.
         o clip-rect (string) comma or space separated values: x, y, width and height
         o cursor (string) CSS type of the cursor
         o cx (number) the x-axis coordinate of the center of the circle, or ellipse
         o cy (number) the y-axis coordinate of the center of the circle, or ellipse
         o fill (string) colour, gradient or image
         o fill-opacity (number)
         o font (string)
         o font-family (string)
         o font-size (number) font size in pixels
         o font-weight (string)
         o height (number)
         o href (string) URL, if specified element behaves as hyperlink
         o opacity (number)
         o path (string) SVG path string format
         o r (number) radius of the circle, ellipse or rounded corner on the rect
         o rx (number) horisontal radius of the ellipse
         o ry (number) vertical radius of the ellipse
         o src (string) image URL, only works for @Element.image element
         o stroke (string) stroke colour
         o stroke-dasharray (string) [“”, “`-`”, “`.`”, “`-.`”, “`-..`”, “`. `”, “`- `”, “`--`”, “`- .`”, “`--.`”, “`--..`”]
         o stroke-linecap (string) [“`butt`”, “`square`”, “`round`”]
         o stroke-linejoin (string) [“`bevel`”, “`round`”, “`miter`”]
         o stroke-miterlimit (number)
         o stroke-opacity (number)
         o stroke-width (number) stroke width in pixels, default is '1'
         o target (string) used with href
         o text (string) contents of the text element. Use `\n` for multiline text
         o text-anchor (string) [“`start`”, “`middle`”, “`end`”], default is “`middle`”
         o title (string) will create tooltip with a given text
         o transform (string) see @Element.transform
         o width (number)
         o x (number)
         o y (number)
         > Gradients
         * Linear gradient format: “`‹angle›-‹colour›[-‹colour›[:‹offset›]]*-‹colour›`”, example: “`90-#fff-#000`” – 90°
         * gradient from white to black or “`0-#fff-#f00:20-#000`” – 0° gradient from white via red (at 20%) to black.
         *
         * radial gradient: “`r[(‹fx›, ‹fy›)]‹colour›[-‹colour›[:‹offset›]]*-‹colour›`”, example: “`r#fff-#000`” –
         * gradient from white to black or “`r(0.25, 0.75)#fff-#000`” – gradient from white to black with focus point
         * at 0.25, 0.75. Focus point coordinates are in 0..1 range. Radial gradients can only be applied to circles and ellipses.
         > Path String
         # <p>Please refer to <a href="http://www.w3.org/TR/SVG/paths.html#PathData" title="Details of a path’s data attribute’s format are described in the SVG specification.">SVG documentation regarding path string</a>. Raphaël fully supports it.</p>
         > Colour Parsing
         # <ul>
         #     <li>Colour name (“<code>red</code>”, “<code>green</code>”, “<code>cornflowerblue</code>”, etc)</li>
         #     <li>#••• — shortened HTML colour: (“<code>#000</code>”, “<code>#fc0</code>”, etc)</li>
         #     <li>#•••••• — full length HTML colour: (“<code>#000000</code>”, “<code>#bd2300</code>”)</li>
         #     <li>rgb(•••, •••, •••) — red, green and blue channels’ values: (“<code>rgb(200,&nbsp;100,&nbsp;0)</code>”)</li>
         #     <li>rgb(•••%, •••%, •••%) — same as above, but in %: (“<code>rgb(100%,&nbsp;175%,&nbsp;0%)</code>”)</li>
         #     <li>rgba(•••, •••, •••, •••) — red, green and blue channels’ values: (“<code>rgba(200,&nbsp;100,&nbsp;0, .5)</code>”)</li>
         #     <li>rgba(•••%, •••%, •••%, •••%) — same as above, but in %: (“<code>rgba(100%,&nbsp;175%,&nbsp;0%, 50%)</code>”)</li>
         #     <li>hsb(•••, •••, •••) — hue, saturation and brightness values: (“<code>hsb(0.5,&nbsp;0.25,&nbsp;1)</code>”)</li>
         #     <li>hsb(•••%, •••%, •••%) — same as above, but in %</li>
         #     <li>hsba(•••, •••, •••, •••) — same as above, but with opacity</li>
         #     <li>hsl(•••, •••, •••) — almost the same as hsb, see <a href="http://en.wikipedia.org/wiki/HSL_and_HSV" title="HSL and HSV - Wikipedia, the free encyclopedia">Wikipedia page</a></li>
         #     <li>hsl(•••%, •••%, •••%) — same as above, but in %</li>
         #     <li>hsla(•••, •••, •••, •••) — same as above, but with opacity</li>
         #     <li>Optionally for hsb and hsl you could specify hue as a degree: “<code>hsl(240deg,&nbsp;1,&nbsp;.5)</code>” or, if you want to go fancy, “<code>hsl(240°,&nbsp;1,&nbsp;.5)</code>”</li>
         # </ul>
         \*/
        elproto.attr = function (name, value) {
            if (this.removed) {
                return this;
            }
            if (name == null) {
                var res = {};
                for (var a in this.attrs) if (this.attrs[has](a)) {
                    res[a] = this.attrs[a];
                }
                res.gradient && res.fill == "none" && (res.fill = res.gradient) && delete res.gradient;
                res.transform = this._.transform;
                return res;
            }
            if (value == null && R.is(name, "string")) {
                if (name == "fill" && this.attrs.fill == "none" && this.attrs.gradient) {
                    return this.attrs.gradient;
                }
                if (name == "transform") {
                    return this._.transform;
                }
                var names = name.split(separator),
                    out = {};
                for (var i = 0, ii = names.length; i < ii; i++) {
                    name = names[i];
                    if (name in this.attrs) {
                        out[name] = this.attrs[name];
                    } else if (R.is(this.paper.customAttributes[name], "function")) {
                        out[name] = this.paper.customAttributes[name].def;
                    } else {
                        out[name] = R._availableAttrs[name];
                    }
                }
                return ii - 1 ? out : out[names[0]];
            }
            if (value == null && R.is(name, "array")) {
                out = {};
                for (i = 0, ii = name.length; i < ii; i++) {
                    out[name[i]] = this.attr(name[i]);
                }
                return out;
            }
            if (value != null) {
                var params = {};
                params[name] = value;
            } else if (name != null && R.is(name, "object")) {
                params = name;
            }
            for (var key in params) {
                eve("raphael.attr." + key + "." + this.id, this, params[key]);
            }
            for (key in this.paper.customAttributes) if (this.paper.customAttributes[has](key) && params[has](key) && R.is(this.paper.customAttributes[key], "function")) {
                var par = this.paper.customAttributes[key].apply(this, [].concat(params[key]));
                this.attrs[key] = params[key];
                for (var subkey in par) if (par[has](subkey)) {
                    params[subkey] = par[subkey];
                }
            }
            setFillAndStroke(this, params);
            return this;
        };
        /*\
         * Element.toFront
         [ method ]
         **
         * Moves the element so it is the closest to the viewer’s eyes, on top of other elements.
         = (object) @Element
         \*/
        elproto.toFront = function () {
            if (this.removed) {
                return this;
            }
            if (this.node.parentNode.tagName.toLowerCase() == "a") {
                this.node.parentNode.parentNode.appendChild(this.node.parentNode);
            } else {
                this.node.parentNode.appendChild(this.node);
            }
            var svg = this.paper;
            svg.top != this && R._tofront(this, svg);
            return this;
        };
        /*\
         * Element.toBack
         [ method ]
         **
         * Moves the element so it is the furthest from the viewer’s eyes, behind other elements.
         = (object) @Element
         \*/
        elproto.toBack = function () {
            if (this.removed) {
                return this;
            }
            var parent = this.node.parentNode;
            if (parent.tagName.toLowerCase() == "a") {
                parent.parentNode.insertBefore(this.node.parentNode, this.node.parentNode.parentNode.firstChild);
            } else if (parent.firstChild != this.node) {
                parent.insertBefore(this.node, this.node.parentNode.firstChild);
            }
            R._toback(this, this.paper);
            var svg = this.paper;
            return this;
        };
        /*\
         * Element.insertAfter
         [ method ]
         **
         * Inserts current object after the given one.
         = (object) @Element
         \*/
        elproto.insertAfter = function (element) {
            if (this.removed) {
                return this;
            }
            var node = element.node || element[element.length - 1].node;
            if (node.nextSibling) {
                node.parentNode.insertBefore(this.node, node.nextSibling);
            } else {
                node.parentNode.appendChild(this.node);
            }
            R._insertafter(this, element, this.paper);
            return this;
        };
        /*\
         * Element.insertBefore
         [ method ]
         **
         * Inserts current object before the given one.
         = (object) @Element
         \*/
        elproto.insertBefore = function (element) {
            if (this.removed) {
                return this;
            }
            var node = element.node || element[0].node;
            node.parentNode.insertBefore(this.node, node);
            R._insertbefore(this, element, this.paper);
            return this;
        };
        elproto.blur = function (size) {
            // Experimental. No Safari support. Use it on your own risk.
            var t = this;
            if (+size !== 0) {
                var fltr = $("filter"),
                    blur = $("feGaussianBlur");
                t.attrs.blur = size;
                fltr.id = R.createUUID();
                $(blur, {stdDeviation: +size || 1.5});
                fltr.appendChild(blur);
                t.paper.defs.appendChild(fltr);
                t._blur = fltr;
                $(t.node, {filter: "url(#" + fltr.id + ")"});
            } else {
                if (t._blur) {
                    t._blur.parentNode.removeChild(t._blur);
                    delete t._blur;
                    delete t.attrs.blur;
                }
                t.node.removeAttribute("filter");
            }
            return t;
        };
        R._engine.circle = function (svg, x, y, r) {
            var el = $("circle");
            svg.canvas && svg.canvas.appendChild(el);
            var res = new Element(el, svg);
            res.attrs = {cx: x, cy: y, r: r, fill: "none", stroke: "#000"};
            res.type = "circle";
            $(el, res.attrs);
            return res;
        };
        R._engine.rect = function (svg, x, y, w, h, r) {
            var el = $("rect");
            svg.canvas && svg.canvas.appendChild(el);
            var res = new Element(el, svg);
            res.attrs = {x: x, y: y, width: w, height: h, r: r || 0, rx: r || 0, ry: r || 0, fill: "none", stroke: "#000"};
            res.type = "rect";
            $(el, res.attrs);
            return res;
        };
        R._engine.ellipse = function (svg, x, y, rx, ry) {
            var el = $("ellipse");
            svg.canvas && svg.canvas.appendChild(el);
            var res = new Element(el, svg);
            res.attrs = {cx: x, cy: y, rx: rx, ry: ry, fill: "none", stroke: "#000"};
            res.type = "ellipse";
            $(el, res.attrs);
            return res;
        };
        R._engine.image = function (svg, src, x, y, w, h) {
            var el = $("image");
            $(el, {x: x, y: y, width: w, height: h, preserveAspectRatio: "none"});
            el.setAttributeNS(xlink, "href", src);
            svg.canvas && svg.canvas.appendChild(el);
            var res = new Element(el, svg);
            res.attrs = {x: x, y: y, width: w, height: h, src: src};
            res.type = "image";
            return res;
        };
        R._engine.text = function (svg, x, y, text) {
            var el = $("text");
            svg.canvas && svg.canvas.appendChild(el);
            var res = new Element(el, svg);
            res.attrs = {
                x: x,
                y: y,
                "text-anchor": "middle",
                text: text,
                font: R._availableAttrs.font,
                stroke: "none",
                fill: "#000"
            };
            res.type = "text";
            setFillAndStroke(res, res.attrs);
            return res;
        };
        R._engine.setSize = function (width, height) {
            this.width = width || this.width;
            this.height = height || this.height;
            this.canvas.setAttribute("width", this.width);
            this.canvas.setAttribute("height", this.height);
            if (this._viewBox) {
                this.setViewBox.apply(this, this._viewBox);
            }
            return this;
        };
        R._engine.create = function () {
            var con = R._getContainer.apply(0, arguments),
                container = con && con.container,
                x = con.x,
                y = con.y,
                width = con.width,
                height = con.height;
            if (!container) {
                throw new Error("SVG container not found.");
            }
            var cnvs = $("svg"),
                css = "overflow:hidden;",
                isFloating;
            x = x || 0;
            y = y || 0;
            width = width || 512;
            height = height || 342;
            $(cnvs, {
                height: height,
                version: 1.1,
                width: width,
                xmlns: "http://www.w3.org/2000/svg"
            });
            if (container == 1) {
                cnvs.style.cssText = css + "position:absolute;left:" + x + "px;top:" + y + "px";
                R._g.doc.body.appendChild(cnvs);
                isFloating = 1;
            } else {
                cnvs.style.cssText = css + "position:relative";
                if (container.firstChild) {
                    container.insertBefore(cnvs, container.firstChild);
                } else {
                    container.appendChild(cnvs);
                }
            }
            container = new R._Paper;
            container.width = width;
            container.height = height;
            container.canvas = cnvs;
            container.clear();
            container._left = container._top = 0;
            isFloating && (container.renderfix = function () {});
            container.renderfix();
            return container;
        };
        R._engine.setViewBox = function (x, y, w, h, fit) {
            eve("raphael.setViewBox", this, this._viewBox, [x, y, w, h, fit]);
            var size = mmax(w / this.width, h / this.height),
                top = this.top,
                aspectRatio = fit ? "meet" : "xMinYMin",
                vb,
                sw;
            if (x == null) {
                if (this._vbSize) {
                    size = 1;
                }
                delete this._vbSize;
                vb = "0 0 " + this.width + S + this.height;
            } else {
                this._vbSize = size;
                vb = x + S + y + S + w + S + h;
            }
            $(this.canvas, {
                viewBox: vb,
                preserveAspectRatio: aspectRatio
            });
            while (size && top) {
                sw = "stroke-width" in top.attrs ? top.attrs["stroke-width"] : 1;
                top.attr({"stroke-width": sw});
                top._.dirty = 1;
                top._.dirtyT = 1;
                top = top.prev;
            }
            this._viewBox = [x, y, w, h, !!fit];
            return this;
        };
        /*\
         * Paper.renderfix
         [ method ]
         **
         * Fixes the issue of Firefox and IE9 regarding subpixel rendering. If paper is dependant
         * on other elements after reflow it could shift half pixel which cause for lines to lost their crispness.
         * This method fixes the issue.
         **
         Special thanks to Mariusz Nowak (http://www.medikoo.com/) for this method.
         \*/
        R.prototype.renderfix = function () {
            var cnvs = this.canvas,
                s = cnvs.style,
                pos;
            try {
                pos = cnvs.getScreenCTM() || cnvs.createSVGMatrix();
            } catch (e) {
                pos = cnvs.createSVGMatrix();
            }
            var left = -pos.e % 1,
                top = -pos.f % 1;
            if (left || top) {
                if (left) {
                    this._left = (this._left + left) % 1;
                    s.left = this._left + "px";
                }
                if (top) {
                    this._top = (this._top + top) % 1;
                    s.top = this._top + "px";
                }
            }
        };
        /*\
         * Paper.clear
         [ method ]
         **
         * Clears the paper, i.e. removes all the elements.
         \*/
        R.prototype.clear = function () {
            R.eve("raphael.clear", this);
            var c = this.canvas;
            while (c.firstChild) {
                c.removeChild(c.firstChild);
            }
            this.bottom = this.top = null;
            (this.desc = $("desc")).appendChild(R._g.doc.createTextNode("Created with Rapha\xebl " + R.version));
            c.appendChild(this.desc);
            c.appendChild(this.defs = $("defs"));
        };
        /*\
         * Paper.remove
         [ method ]
         **
         * Removes the paper from the DOM.
         \*/
        R.prototype.remove = function () {
            eve("raphael.remove", this);
            this.canvas.parentNode && this.canvas.parentNode.removeChild(this.canvas);
            for (var i in this) {
                this[i] = typeof this[i] == "function" ? R._removedFactory(i) : null;
            }
        };
        var setproto = R.st;
        for (var method in elproto) if (elproto[has](method) && !setproto[has](method)) {
            setproto[method] = (function (methodname) {
                return function () {
                    var arg = arguments;
                    return this.forEach(function (el) {
                        el[methodname].apply(el, arg);
                    });
                };
            })(method);
        }
    })();

// ┌─────────────────────────────────────────────────────────────────────┐ \\
// │ Raphaël - JavaScript Vector Library                                 │ \\
// ├─────────────────────────────────────────────────────────────────────┤ \\
// │ VML Module                                                          │ \\
// ├─────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright (c) 2008-2011 Dmitry Baranovskiy (http://raphaeljs.com)   │ \\
// │ Copyright (c) 2008-2011 Sencha Labs (http://sencha.com)             │ \\
// │ Licensed under the MIT (http://raphaeljs.com/license.html) license. │ \\
// └─────────────────────────────────────────────────────────────────────┘ \\

    (function(){
        if (!R.vml) {
            return;
        }
        var has = "hasOwnProperty",
            Str = String,
            toFloat = parseFloat,
            math = Math,
            round = math.round,
            mmax = math.max,
            mmin = math.min,
            abs = math.abs,
            fillString = "fill",
            separator = /[, ]+/,
            eve = R.eve,
            ms = " progid:DXImageTransform.Microsoft",
            S = " ",
            E = "",
            map = {M: "m", L: "l", C: "c", Z: "x", m: "t", l: "r", c: "v", z: "x"},
            bites = /([clmz]),?([^clmz]*)/gi,
            blurregexp = / progid:\S+Blur\([^\)]+\)/g,
            val = /-?[^,\s-]+/g,
            cssDot = "position:absolute;left:0;top:0;width:1px;height:1px",
            zoom = 21600,
            pathTypes = {path: 1, rect: 1, image: 1},
            ovalTypes = {circle: 1, ellipse: 1},
            path2vml = function (path) {
                var total =  /[ahqstv]/ig,
                    command = R._pathToAbsolute;
                Str(path).match(total) && (command = R._path2curve);
                total = /[clmz]/g;
                if (command == R._pathToAbsolute && !Str(path).match(total)) {
                    var res = Str(path).replace(bites, function (all, command, args) {
                        var vals = [],
                            isMove = command.toLowerCase() == "m",
                            res = map[command];
                        args.replace(val, function (value) {
                            if (isMove && vals.length == 2) {
                                res += vals + map[command == "m" ? "l" : "L"];
                                vals = [];
                            }
                            vals.push(round(value * zoom));
                        });
                        return res + vals;
                    });
                    return res;
                }
                var pa = command(path), p, r;
                res = [];
                for (var i = 0, ii = pa.length; i < ii; i++) {
                    p = pa[i];
                    r = pa[i][0].toLowerCase();
                    r == "z" && (r = "x");
                    for (var j = 1, jj = p.length; j < jj; j++) {
                        r += round(p[j] * zoom) + (j != jj - 1 ? "," : E);
                    }
                    res.push(r);
                }
                return res.join(S);
            },
            compensation = function (deg, dx, dy) {
                var m = R.matrix();
                m.rotate(-deg, .5, .5);
                return {
                    dx: m.x(dx, dy),
                    dy: m.y(dx, dy)
                };
            },
            setCoords = function (p, sx, sy, dx, dy, deg) {
                var _ = p._,
                    m = p.matrix,
                    fillpos = _.fillpos,
                    o = p.node,
                    s = o.style,
                    y = 1,
                    flip = "",
                    dxdy,
                    kx = zoom / sx,
                    ky = zoom / sy;
                s.visibility = "hidden";
                if (!sx || !sy) {
                    return;
                }
                o.coordsize = abs(kx) + S + abs(ky);
                s.rotation = deg * (sx * sy < 0 ? -1 : 1);
                if (deg) {
                    var c = compensation(deg, dx, dy);
                    dx = c.dx;
                    dy = c.dy;
                }
                sx < 0 && (flip += "x");
                sy < 0 && (flip += " y") && (y = -1);
                s.flip = flip;
                o.coordorigin = (dx * -kx) + S + (dy * -ky);
                if (fillpos || _.fillsize) {
                    var fill = o.getElementsByTagName(fillString);
                    fill = fill && fill[0];
                    o.removeChild(fill);
                    if (fillpos) {
                        c = compensation(deg, m.x(fillpos[0], fillpos[1]), m.y(fillpos[0], fillpos[1]));
                        fill.position = c.dx * y + S + c.dy * y;
                    }
                    if (_.fillsize) {
                        fill.size = _.fillsize[0] * abs(sx) + S + _.fillsize[1] * abs(sy);
                    }
                    o.appendChild(fill);
                }
                s.visibility = "visible";
            };
        R.toString = function () {
            return  "Your browser doesn\u2019t support SVG. Falling down to VML.\nYou are running Rapha\xebl " + this.version;
        };
        var addArrow = function (o, value, isEnd) {
                var values = Str(value).toLowerCase().split("-"),
                    se = isEnd ? "end" : "start",
                    i = values.length,
                    type = "classic",
                    w = "medium",
                    h = "medium";
                while (i--) {
                    switch (values[i]) {
                        case "block":
                        case "classic":
                        case "oval":
                        case "diamond":
                        case "open":
                        case "none":
                            type = values[i];
                            break;
                        case "wide":
                        case "narrow": h = values[i]; break;
                        case "long":
                        case "short": w = values[i]; break;
                    }
                }
                var stroke = o.node.getElementsByTagName("stroke")[0];
                stroke[se + "arrow"] = type;
                stroke[se + "arrowlength"] = w;
                stroke[se + "arrowwidth"] = h;
            },
            setFillAndStroke = function (o, params) {
                // o.paper.canvas.style.display = "none";
                o.attrs = o.attrs || {};
                var node = o.node,
                    a = o.attrs,
                    s = node.style,
                    xy,
                    newpath = pathTypes[o.type] && (params.x != a.x || params.y != a.y || params.width != a.width || params.height != a.height || params.cx != a.cx || params.cy != a.cy || params.rx != a.rx || params.ry != a.ry || params.r != a.r),
                    isOval = ovalTypes[o.type] && (a.cx != params.cx || a.cy != params.cy || a.r != params.r || a.rx != params.rx || a.ry != params.ry),
                    res = o;


                for (var par in params) if (params[has](par)) {
                    a[par] = params[par];
                }
                if (newpath) {
                    a.path = R._getPath[o.type](o);
                    o._.dirty = 1;
                }
                params.href && (node.href = params.href);
                params.title && (node.title = params.title);
                params.target && (node.target = params.target);
                params.cursor && (s.cursor = params.cursor);
                "blur" in params && o.blur(params.blur);
                if (params.path && o.type == "path" || newpath) {
                    node.path = path2vml(~Str(a.path).toLowerCase().indexOf("r") ? R._pathToAbsolute(a.path) : a.path);
                    if (o.type == "image") {
                        o._.fillpos = [a.x, a.y];
                        o._.fillsize = [a.width, a.height];
                        setCoords(o, 1, 1, 0, 0, 0);
                    }
                }
                "transform" in params && o.transform(params.transform);
                if (isOval) {
                    var cx = +a.cx,
                        cy = +a.cy,
                        rx = +a.rx || +a.r || 0,
                        ry = +a.ry || +a.r || 0;
                    node.path = R.format("ar{0},{1},{2},{3},{4},{1},{4},{1}x", round((cx - rx) * zoom), round((cy - ry) * zoom), round((cx + rx) * zoom), round((cy + ry) * zoom), round(cx * zoom));
                    o._.dirty = 1;
                }
                if ("clip-rect" in params) {
                    var rect = Str(params["clip-rect"]).split(separator);
                    if (rect.length == 4) {
                        rect[2] = +rect[2] + (+rect[0]);
                        rect[3] = +rect[3] + (+rect[1]);
                        var div = node.clipRect || R._g.doc.createElement("div"),
                            dstyle = div.style;
                        dstyle.clip = R.format("rect({1}px {2}px {3}px {0}px)", rect);
                        if (!node.clipRect) {
                            dstyle.position = "absolute";
                            dstyle.top = 0;
                            dstyle.left = 0;
                            dstyle.width = o.paper.width + "px";
                            dstyle.height = o.paper.height + "px";
                            node.parentNode.insertBefore(div, node);
                            div.appendChild(node);
                            node.clipRect = div;
                        }
                    }
                    if (!params["clip-rect"]) {
                        node.clipRect && (node.clipRect.style.clip = "auto");
                    }
                }
                if (o.textpath) {
                    var textpathStyle = o.textpath.style;
                    params.font && (textpathStyle.font = params.font);
                    params["font-family"] && (textpathStyle.fontFamily = '"' + params["font-family"].split(",")[0].replace(/^['"]+|['"]+$/g, E) + '"');
                    params["font-size"] && (textpathStyle.fontSize = params["font-size"]);
                    params["font-weight"] && (textpathStyle.fontWeight = params["font-weight"]);
                    params["font-style"] && (textpathStyle.fontStyle = params["font-style"]);
                }
                if ("arrow-start" in params) {
                    addArrow(res, params["arrow-start"]);
                }
                if ("arrow-end" in params) {
                    addArrow(res, params["arrow-end"], 1);
                }
                if (params.opacity != null ||
                    params["stroke-width"] != null ||
                    params.fill != null ||
                    params.src != null ||
                    params.stroke != null ||
                    params["stroke-width"] != null ||
                    params["stroke-opacity"] != null ||
                    params["fill-opacity"] != null ||
                    params["stroke-dasharray"] != null ||
                    params["stroke-miterlimit"] != null ||
                    params["stroke-linejoin"] != null ||
                    params["stroke-linecap"] != null) {
                    var fill = node.getElementsByTagName(fillString),
                        newfill = false;
                    fill = fill && fill[0];
                    !fill && (newfill = fill = createNode(fillString));
                    if (o.type == "image" && params.src) {
                        fill.src = params.src;
                    }
                    params.fill && (fill.on = true);
                    if (fill.on == null || params.fill == "none" || params.fill === null) {
                        fill.on = false;
                    }
                    if (fill.on && params.fill) {
                        var isURL = Str(params.fill).match(R._ISURL);
                        if (isURL) {
                            fill.parentNode == node && node.removeChild(fill);
                            fill.rotate = true;
                            fill.src = isURL[1];
                            fill.type = "tile";
                            var bbox = o.getBBox(1);
                            fill.position = bbox.x + S + bbox.y;
                            o._.fillpos = [bbox.x, bbox.y];

                            R._preload(isURL[1], function () {
                                o._.fillsize = [this.offsetWidth, this.offsetHeight];
                            });
                        } else {
                            fill.color = R.getRGB(params.fill).hex;
                            fill.src = E;
                            fill.type = "solid";
                            if (R.getRGB(params.fill).error && (res.type in {circle: 1, ellipse: 1} || Str(params.fill).charAt() != "r") && addGradientFill(res, params.fill, fill)) {
                                a.fill = "none";
                                a.gradient = params.fill;
                                fill.rotate = false;
                            }
                        }
                    }
                    if ("fill-opacity" in params || "opacity" in params) {
                        var opacity = ((+a["fill-opacity"] + 1 || 2) - 1) * ((+a.opacity + 1 || 2) - 1) * ((+R.getRGB(params.fill).o + 1 || 2) - 1);
                        opacity = mmin(mmax(opacity, 0), 1);
                        fill.opacity = opacity;
                        if (fill.src) {
                            fill.color = "none";
                        }
                    }
                    node.appendChild(fill);
                    var stroke = (node.getElementsByTagName("stroke") && node.getElementsByTagName("stroke")[0]),
                        newstroke = false;
                    !stroke && (newstroke = stroke = createNode("stroke"));
                    if ((params.stroke && params.stroke != "none") ||
                        params["stroke-width"] ||
                        params["stroke-opacity"] != null ||
                        params["stroke-dasharray"] ||
                        params["stroke-miterlimit"] ||
                        params["stroke-linejoin"] ||
                        params["stroke-linecap"]) {
                        stroke.on = true;
                    }
                    (params.stroke == "none" || params.stroke === null || stroke.on == null || params.stroke == 0 || params["stroke-width"] == 0) && (stroke.on = false);
                    var strokeColor = R.getRGB(params.stroke);
                    stroke.on && params.stroke && (stroke.color = strokeColor.hex);
                    opacity = ((+a["stroke-opacity"] + 1 || 2) - 1) * ((+a.opacity + 1 || 2) - 1) * ((+strokeColor.o + 1 || 2) - 1);
                    var width = (toFloat(params["stroke-width"]) || 1) * .75;
                    opacity = mmin(mmax(opacity, 0), 1);
                    params["stroke-width"] == null && (width = a["stroke-width"]);
                    params["stroke-width"] && (stroke.weight = width);
                    width && width < 1 && (opacity *= width) && (stroke.weight = 1);
                    stroke.opacity = opacity;

                    params["stroke-linejoin"] && (stroke.joinstyle = params["stroke-linejoin"] || "miter");
                    stroke.miterlimit = params["stroke-miterlimit"] || 8;
                    params["stroke-linecap"] && (stroke.endcap = params["stroke-linecap"] == "butt" ? "flat" : params["stroke-linecap"] == "square" ? "square" : "round");
                    if (params["stroke-dasharray"]) {
                        var dasharray = {
                            "-": "shortdash",
                            ".": "shortdot",
                            "-.": "shortdashdot",
                            "-..": "shortdashdotdot",
                            ". ": "dot",
                            "- ": "dash",
                            "--": "longdash",
                            "- .": "dashdot",
                            "--.": "longdashdot",
                            "--..": "longdashdotdot"
                        };
                        stroke.dashstyle = dasharray[has](params["stroke-dasharray"]) ? dasharray[params["stroke-dasharray"]] : E;
                    }
                    newstroke && node.appendChild(stroke);
                }
                if (res.type == "text") {
                    res.paper.canvas.style.display = E;
                    var span = res.paper.span,
                        m = 100,
                        fontSize = a.font && a.font.match(/\d+(?:\.\d*)?(?=px)/);
                    s = span.style;
                    a.font && (s.font = a.font);
                    a["font-family"] && (s.fontFamily = a["font-family"]);
                    a["font-weight"] && (s.fontWeight = a["font-weight"]);
                    a["font-style"] && (s.fontStyle = a["font-style"]);
                    fontSize = toFloat(a["font-size"] || fontSize && fontSize[0]) || 10;
                    s.fontSize = fontSize * m + "px";
                    res.textpath.string && (span.innerHTML = Str(res.textpath.string).replace(/</g, "&#60;").replace(/&/g, "&#38;").replace(/\n/g, "<br>"));
                    var brect = span.getBoundingClientRect();
                    res.W = a.w = (brect.right - brect.left) / m;
                    res.H = a.h = (brect.bottom - brect.top) / m;
                    // res.paper.canvas.style.display = "none";
                    res.X = a.x;
                    res.Y = a.y + res.H / 2;

                    ("x" in params || "y" in params) && (res.path.v = R.format("m{0},{1}l{2},{1}", round(a.x * zoom), round(a.y * zoom), round(a.x * zoom) + 1));
                    var dirtyattrs = ["x", "y", "text", "font", "font-family", "font-weight", "font-style", "font-size"];
                    for (var d = 0, dd = dirtyattrs.length; d < dd; d++) if (dirtyattrs[d] in params) {
                        res._.dirty = 1;
                        break;
                    }

                    // text-anchor emulation
                    switch (a["text-anchor"]) {
                        case "start":
                            res.textpath.style["v-text-align"] = "left";
                            res.bbx = res.W / 2;
                            break;
                        case "end":
                            res.textpath.style["v-text-align"] = "right";
                            res.bbx = -res.W / 2;
                            break;
                        default:
                            res.textpath.style["v-text-align"] = "center";
                            res.bbx = 0;
                            break;
                    }
                    res.textpath.style["v-text-kern"] = true;
                }
                // res.paper.canvas.style.display = E;
            },
            addGradientFill = function (o, gradient, fill) {
                o.attrs = o.attrs || {};
                var attrs = o.attrs,
                    pow = Math.pow,
                    opacity,
                    oindex,
                    type = "linear",
                    fxfy = ".5 .5";
                o.attrs.gradient = gradient;
                gradient = Str(gradient).replace(R._radial_gradient, function (all, fx, fy) {
                    type = "radial";
                    if (fx && fy) {
                        fx = toFloat(fx);
                        fy = toFloat(fy);
                        pow(fx - .5, 2) + pow(fy - .5, 2) > .25 && (fy = math.sqrt(.25 - pow(fx - .5, 2)) * ((fy > .5) * 2 - 1) + .5);
                        fxfy = fx + S + fy;
                    }
                    return E;
                });
                gradient = gradient.split(/\s*\-\s*/);
                if (type == "linear") {
                    var angle = gradient.shift();
                    angle = -toFloat(angle);
                    if (isNaN(angle)) {
                        return null;
                    }
                }
                var dots = R._parseDots(gradient);
                if (!dots) {
                    return null;
                }
                o = o.shape || o.node;
                if (dots.length) {
                    o.removeChild(fill);
                    fill.on = true;
                    fill.method = "none";
                    fill.color = dots[0].color;
                    fill.color2 = dots[dots.length - 1].color;
                    var clrs = [];
                    for (var i = 0, ii = dots.length; i < ii; i++) {
                        dots[i].offset && clrs.push(dots[i].offset + S + dots[i].color);
                    }
                    fill.colors = clrs.length ? clrs.join() : "0% " + fill.color;
                    if (type == "radial") {
                        fill.type = "gradientTitle";
                        fill.focus = "100%";
                        fill.focussize = "0 0";
                        fill.focusposition = fxfy;
                        fill.angle = 0;
                    } else {
                        // fill.rotate= true;
                        fill.type = "gradient";
                        fill.angle = (270 - angle) % 360;
                    }
                    o.appendChild(fill);
                }
                return 1;
            },
            Element = function (node, vml) {
                this[0] = this.node = node;
                node.raphael = true;
                this.id = R._oid++;
                node.raphaelid = this.id;
                this.X = 0;
                this.Y = 0;
                this.attrs = {};
                this.paper = vml;
                this.matrix = R.matrix();
                this._ = {
                    transform: [],
                    sx: 1,
                    sy: 1,
                    dx: 0,
                    dy: 0,
                    deg: 0,
                    dirty: 1,
                    dirtyT: 1
                };
                !vml.bottom && (vml.bottom = this);
                this.prev = vml.top;
                vml.top && (vml.top.next = this);
                vml.top = this;
                this.next = null;
            };
        var elproto = R.el;

        Element.prototype = elproto;
        elproto.constructor = Element;
        elproto.transform = function (tstr) {
            if (tstr == null) {
                return this._.transform;
            }
            var vbs = this.paper._viewBoxShift,
                vbt = vbs ? "s" + [vbs.scale, vbs.scale] + "-1-1t" + [vbs.dx, vbs.dy] : E,
                oldt;
            if (vbs) {
                oldt = tstr = Str(tstr).replace(/\.{3}|\u2026/g, this._.transform || E);
            }
            R._extractTransform(this, vbt + tstr);
            var matrix = this.matrix.clone(),
                skew = this.skew,
                o = this.node,
                split,
                isGrad = ~Str(this.attrs.fill).indexOf("-"),
                isPatt = !Str(this.attrs.fill).indexOf("url(");
            matrix.translate(-.5, -.5);
            if (isPatt || isGrad || this.type == "image") {
                skew.matrix = "1 0 0 1";
                skew.offset = "0 0";
                split = matrix.split();
                if ((isGrad && split.noRotation) || !split.isSimple) {
                    o.style.filter = matrix.toFilter();
                    var bb = this.getBBox(),
                        bbt = this.getBBox(1),
                        dx = bb.x - bbt.x,
                        dy = bb.y - bbt.y;
                    o.coordorigin = (dx * -zoom) + S + (dy * -zoom);
                    setCoords(this, 1, 1, dx, dy, 0);
                } else {
                    o.style.filter = E;
                    setCoords(this, split.scalex, split.scaley, split.dx, split.dy, split.rotate);
                }
            } else {
                o.style.filter = E;
                skew.matrix = Str(matrix);
                skew.offset = matrix.offset();
            }
            oldt && (this._.transform = oldt);
            return this;
        };
        elproto.rotate = function (deg, cx, cy) {
            if (this.removed) {
                return this;
            }
            if (deg == null) {
                return;
            }
            deg = Str(deg).split(separator);
            if (deg.length - 1) {
                cx = toFloat(deg[1]);
                cy = toFloat(deg[2]);
            }
            deg = toFloat(deg[0]);
            (cy == null) && (cx = cy);
            if (cx == null || cy == null) {
                var bbox = this.getBBox(1);
                cx = bbox.x + bbox.width / 2;
                cy = bbox.y + bbox.height / 2;
            }
            this._.dirtyT = 1;
            this.transform(this._.transform.concat([["r", deg, cx, cy]]));
            return this;
        };
        elproto.translate = function (dx, dy) {
            if (this.removed) {
                return this;
            }
            dx = Str(dx).split(separator);
            if (dx.length - 1) {
                dy = toFloat(dx[1]);
            }
            dx = toFloat(dx[0]) || 0;
            dy = +dy || 0;
            if (this._.bbox) {
                this._.bbox.x += dx;
                this._.bbox.y += dy;
            }
            this.transform(this._.transform.concat([["t", dx, dy]]));
            return this;
        };
        elproto.scale = function (sx, sy, cx, cy) {
            if (this.removed) {
                return this;
            }
            sx = Str(sx).split(separator);
            if (sx.length - 1) {
                sy = toFloat(sx[1]);
                cx = toFloat(sx[2]);
                cy = toFloat(sx[3]);
                isNaN(cx) && (cx = null);
                isNaN(cy) && (cy = null);
            }
            sx = toFloat(sx[0]);
            (sy == null) && (sy = sx);
            (cy == null) && (cx = cy);
            if (cx == null || cy == null) {
                var bbox = this.getBBox(1);
            }
            cx = cx == null ? bbox.x + bbox.width / 2 : cx;
            cy = cy == null ? bbox.y + bbox.height / 2 : cy;

            this.transform(this._.transform.concat([["s", sx, sy, cx, cy]]));
            this._.dirtyT = 1;
            return this;
        };
        elproto.hide = function () {
            !this.removed && (this.node.style.display = "none");
            return this;
        };
        elproto.show = function () {
            !this.removed && (this.node.style.display = E);
            return this;
        };
        elproto._getBBox = function () {
            if (this.removed) {
                return {};
            }
            return {
                x: this.X + (this.bbx || 0) - this.W / 2,
                y: this.Y - this.H,
                width: this.W,
                height: this.H
            };
        };
        elproto.remove = function () {
            if (this.removed || !this.node.parentNode) {
                return;
            }
            this.paper.__set__ && this.paper.__set__.exclude(this);
            R.eve.unbind("raphael.*.*." + this.id);
            R._tear(this, this.paper);
            this.node.parentNode.removeChild(this.node);
            this.shape && this.shape.parentNode.removeChild(this.shape);
            for (var i in this) {
                this[i] = typeof this[i] == "function" ? R._removedFactory(i) : null;
            }
            this.removed = true;
        };
        elproto.attr = function (name, value) {
            if (this.removed) {
                return this;
            }
            if (name == null) {
                var res = {};
                for (var a in this.attrs) if (this.attrs[has](a)) {
                    res[a] = this.attrs[a];
                }
                res.gradient && res.fill == "none" && (res.fill = res.gradient) && delete res.gradient;
                res.transform = this._.transform;
                return res;
            }
            if (value == null && R.is(name, "string")) {
                if (name == fillString && this.attrs.fill == "none" && this.attrs.gradient) {
                    return this.attrs.gradient;
                }
                var names = name.split(separator),
                    out = {};
                for (var i = 0, ii = names.length; i < ii; i++) {
                    name = names[i];
                    if (name in this.attrs) {
                        out[name] = this.attrs[name];
                    } else if (R.is(this.paper.customAttributes[name], "function")) {
                        out[name] = this.paper.customAttributes[name].def;
                    } else {
                        out[name] = R._availableAttrs[name];
                    }
                }
                return ii - 1 ? out : out[names[0]];
            }
            if (this.attrs && value == null && R.is(name, "array")) {
                out = {};
                for (i = 0, ii = name.length; i < ii; i++) {
                    out[name[i]] = this.attr(name[i]);
                }
                return out;
            }
            var params;
            if (value != null) {
                params = {};
                params[name] = value;
            }
            value == null && R.is(name, "object") && (params = name);
            for (var key in params) {
                eve("raphael.attr." + key + "." + this.id, this, params[key]);
            }
            if (params) {
                for (key in this.paper.customAttributes) if (this.paper.customAttributes[has](key) && params[has](key) && R.is(this.paper.customAttributes[key], "function")) {
                    var par = this.paper.customAttributes[key].apply(this, [].concat(params[key]));
                    this.attrs[key] = params[key];
                    for (var subkey in par) if (par[has](subkey)) {
                        params[subkey] = par[subkey];
                    }
                }
                // this.paper.canvas.style.display = "none";
                if (params.text && this.type == "text") {
                    this.textpath.string = params.text;
                }
                setFillAndStroke(this, params);
                // this.paper.canvas.style.display = E;
            }
            return this;
        };
        elproto.toFront = function () {
            !this.removed && this.node.parentNode.appendChild(this.node);
            this.paper && this.paper.top != this && R._tofront(this, this.paper);
            return this;
        };
        elproto.toBack = function () {
            if (this.removed) {
                return this;
            }
            if (this.node.parentNode.firstChild != this.node) {
                this.node.parentNode.insertBefore(this.node, this.node.parentNode.firstChild);
                R._toback(this, this.paper);
            }
            return this;
        };
        elproto.insertAfter = function (element) {
            if (this.removed) {
                return this;
            }
            if (element.constructor == R.st.constructor) {
                element = element[element.length - 1];
            }
            if (element.node.nextSibling) {
                element.node.parentNode.insertBefore(this.node, element.node.nextSibling);
            } else {
                element.node.parentNode.appendChild(this.node);
            }
            R._insertafter(this, element, this.paper);
            return this;
        };
        elproto.insertBefore = function (element) {
            if (this.removed) {
                return this;
            }
            if (element.constructor == R.st.constructor) {
                element = element[0];
            }
            element.node.parentNode.insertBefore(this.node, element.node);
            R._insertbefore(this, element, this.paper);
            return this;
        };
        elproto.blur = function (size) {
            var s = this.node.runtimeStyle,
                f = s.filter;
            f = f.replace(blurregexp, E);
            if (+size !== 0) {
                this.attrs.blur = size;
                s.filter = f + S + ms + ".Blur(pixelradius=" + (+size || 1.5) + ")";
                s.margin = R.format("-{0}px 0 0 -{0}px", round(+size || 1.5));
            } else {
                s.filter = f;
                s.margin = 0;
                delete this.attrs.blur;
            }
            return this;
        };

        R._engine.path = function (pathString, vml) {
            var el = createNode("shape");
            el.style.cssText = cssDot;
            el.coordsize = zoom + S + zoom;
            el.coordorigin = vml.coordorigin;
            var p = new Element(el, vml),
                attr = {fill: "none", stroke: "#000"};
            pathString && (attr.path = pathString);
            p.type = "path";
            p.path = [];
            p.Path = E;
            setFillAndStroke(p, attr);
            vml.canvas.appendChild(el);
            var skew = createNode("skew");
            skew.on = true;
            el.appendChild(skew);
            p.skew = skew;
            p.transform(E);
            return p;
        };
        R._engine.rect = function (vml, x, y, w, h, r) {
            var path = R._rectPath(x, y, w, h, r),
                res = vml.path(path),
                a = res.attrs;
            res.X = a.x = x;
            res.Y = a.y = y;
            res.W = a.width = w;
            res.H = a.height = h;
            a.r = r;
            a.path = path;
            res.type = "rect";
            return res;
        };
        R._engine.ellipse = function (vml, x, y, rx, ry) {
            var res = vml.path(),
                a = res.attrs;
            res.X = x - rx;
            res.Y = y - ry;
            res.W = rx * 2;
            res.H = ry * 2;
            res.type = "ellipse";
            setFillAndStroke(res, {
                cx: x,
                cy: y,
                rx: rx,
                ry: ry
            });
            return res;
        };
        R._engine.circle = function (vml, x, y, r) {
            var res = vml.path(),
                a = res.attrs;
            res.X = x - r;
            res.Y = y - r;
            res.W = res.H = r * 2;
            res.type = "circle";
            setFillAndStroke(res, {
                cx: x,
                cy: y,
                r: r
            });
            return res;
        };
        R._engine.image = function (vml, src, x, y, w, h) {
            var path = R._rectPath(x, y, w, h),
                res = vml.path(path).attr({stroke: "none"}),
                a = res.attrs,
                node = res.node,
                fill = node.getElementsByTagName(fillString)[0];
            a.src = src;
            res.X = a.x = x;
            res.Y = a.y = y;
            res.W = a.width = w;
            res.H = a.height = h;
            a.path = path;
            res.type = "image";
            fill.parentNode == node && node.removeChild(fill);
            fill.rotate = true;
            fill.src = src;
            fill.type = "tile";
            res._.fillpos = [x, y];
            res._.fillsize = [w, h];
            node.appendChild(fill);
            setCoords(res, 1, 1, 0, 0, 0);
            return res;
        };
        R._engine.text = function (vml, x, y, text) {
            var el = createNode("shape"),
                path = createNode("path"),
                o = createNode("textpath");
            x = x || 0;
            y = y || 0;
            text = text || "";
            path.v = R.format("m{0},{1}l{2},{1}", round(x * zoom), round(y * zoom), round(x * zoom) + 1);
            path.textpathok = true;
            o.string = Str(text);
            o.on = true;
            el.style.cssText = cssDot;
            el.coordsize = zoom + S + zoom;
            el.coordorigin = "0 0";
            var p = new Element(el, vml),
                attr = {
                    fill: "#000",
                    stroke: "none",
                    font: R._availableAttrs.font,
                    text: text
                };
            p.shape = el;
            p.path = path;
            p.textpath = o;
            p.type = "text";
            p.attrs.text = Str(text);
            p.attrs.x = x;
            p.attrs.y = y;
            p.attrs.w = 1;
            p.attrs.h = 1;
            setFillAndStroke(p, attr);
            el.appendChild(o);
            el.appendChild(path);
            vml.canvas.appendChild(el);
            var skew = createNode("skew");
            skew.on = true;
            el.appendChild(skew);
            p.skew = skew;
            p.transform(E);
            return p;
        };
        R._engine.setSize = function (width, height) {
            var cs = this.canvas.style;
            this.width = width;
            this.height = height;
            width == +width && (width += "px");
            height == +height && (height += "px");
            cs.width = width;
            cs.height = height;
            cs.clip = "rect(0 " + width + " " + height + " 0)";
            if (this._viewBox) {
                R._engine.setViewBox.apply(this, this._viewBox);
            }
            return this;
        };
        R._engine.setViewBox = function (x, y, w, h, fit) {
            R.eve("raphael.setViewBox", this, this._viewBox, [x, y, w, h, fit]);
            var width = this.width,
                height = this.height,
                size = 1 / mmax(w / width, h / height),
                H, W;
            if (fit) {
                H = height / h;
                W = width / w;
                if (w * H < width) {
                    x -= (width - w * H) / 2 / H;
                }
                if (h * W < height) {
                    y -= (height - h * W) / 2 / W;
                }
            }
            this._viewBox = [x, y, w, h, !!fit];
            this._viewBoxShift = {
                dx: -x,
                dy: -y,
                scale: size
            };
            this.forEach(function (el) {
                el.transform("...");
            });
            return this;
        };
        var createNode;
        R._engine.initWin = function (win) {
            var doc = win.document;
            doc.createStyleSheet().addRule(".rvml", "behavior:url(#default#VML)");
            try {
                !doc.namespaces.rvml && doc.namespaces.add("rvml", "urn:schemas-microsoft-com:vml");
                createNode = function (tagName) {
                    return doc.createElement('<rvml:' + tagName + ' class="rvml">');
                };
            } catch (e) {
                createNode = function (tagName) {
                    return doc.createElement('<' + tagName + ' xmlns="urn:schemas-microsoft.com:vml" class="rvml">');
                };
            }
        };
        R._engine.initWin(R._g.win);
        R._engine.create = function () {
            var con = R._getContainer.apply(0, arguments),
                container = con.container,
                height = con.height,
                s,
                width = con.width,
                x = con.x,
                y = con.y;
            if (!container) {
                throw new Error("VML container not found.");
            }
            var res = new R._Paper,
                c = res.canvas = R._g.doc.createElement("div"),
                cs = c.style;
            x = x || 0;
            y = y || 0;
            width = width || 512;
            height = height || 342;
            res.width = width;
            res.height = height;
            width == +width && (width += "px");
            height == +height && (height += "px");
            res.coordsize = zoom * 1e3 + S + zoom * 1e3;
            res.coordorigin = "0 0";
            res.span = R._g.doc.createElement("span");
            res.span.style.cssText = "position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;";
            c.appendChild(res.span);
            cs.cssText = R.format("top:0;left:0;width:{0};height:{1};display:inline-block;position:relative;clip:rect(0 {0} {1} 0);overflow:hidden", width, height);
            if (container == 1) {
                R._g.doc.body.appendChild(c);
                cs.left = x + "px";
                cs.top = y + "px";
                cs.position = "absolute";
            } else {
                if (container.firstChild) {
                    container.insertBefore(c, container.firstChild);
                } else {
                    container.appendChild(c);
                }
            }
            res.renderfix = function () {};
            return res;
        };
        R.prototype.clear = function () {
            R.eve("raphael.clear", this);
            this.canvas.innerHTML = E;
            this.span = R._g.doc.createElement("span");
            this.span.style.cssText = "position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;display:inline;";
            this.canvas.appendChild(this.span);
            this.bottom = this.top = null;
        };
        R.prototype.remove = function () {
            R.eve("raphael.remove", this);
            this.canvas.parentNode.removeChild(this.canvas);
            for (var i in this) {
                this[i] = typeof this[i] == "function" ? R._removedFactory(i) : null;
            }
            return true;
        };

        var setproto = R.st;
        for (var method in elproto) if (elproto[has](method) && !setproto[has](method)) {
            setproto[method] = (function (methodname) {
                return function () {
                    var arg = arguments;
                    return this.forEach(function (el) {
                        el[methodname].apply(el, arg);
                    });
                };
            })(method);
        }
    })();

    // EXPOSE
    // SVG and VML are appended just before the EXPOSE line
    // Even with AMD, Raphael should be defined globally
    oldRaphael.was ? (g.win.Raphael = R) : (Raphael = R);

    return R;
}));
(function () {
    HTMap.Map = Class.create();
    HTMap.Map.prototype = {
        mapTypes: new Object(),
        currentMapType: null,
        initialize: function (container, opts) {
            Util.setClassEvent(this);
            var defaultOpts = {
                MapBackgroundImage: '', //地图背景图片即：地图容器的backgroundImage属性使用的图片url路径
                ShowScale: false, //是否显示比例尺
                PoweredBy: null, //是否显示版权信息,该对象将作为PoweredByControl控件的参数(类型为Object)
                ShowPixeliInStatus: true, //在地图上移动鼠标的时候，是否在状态栏显示鼠标的位置
                NotFoundImg: ""//请求瓦片失败后的替代图片
            };
            this.opts = {};
            Util.setOptionsValue(this.opts, opts, defaultOpts);
            this.container = container;
            if (this.opts.MapBackgroundImage) this.container.style.backgroundImage = 'url(' + this.opts.MapBackgroundImage + ')';
            this.mapId = Util.createUniqueID();
            this.model = new HTMap.MapModel(this.mapId);
            this.model.Map = this;
            this.mapControl = new HTMap.MapControl("map_" + this.mapId, this.container, {
                NotFoundImg: this.opts.NotFoundImg
            });
            this.model.controls[this.mapControl.id] = this.mapControl;

            if (this.opts.PoweredBy) {
                var poweredby = new HTMap.PoweredByControl(container, this.opts.PoweredBy);
                this.model.controls[poweredby.id] = poweredby;
            }
            if (this.opts.ShowScale) {
                var scale = new HTMap.ScaleControl(container, this);
                this.model.controls[scale.id] = scale;
            }

            Event.observe(this.mapControl.mapDiv, "mousewheel", this.map_mousewheel.bindAsEventListener(this));
            Event.observe(document, "keydown", this.map_keydown.bindAsEventListener(this));
            Event.observe(this.mapControl.mapDiv, "mousemove", this.map_mousemove.bindAsEventListener(this));

            //各类事件
            var me = this;
            Event.observe(this.mapControl.mapDiv, "click", function (e) {
                var coord = Util.getCoordinateByPixel2(Util.getMousePixel(e), me.model.getZoom(), me).getPoint();
                me.triggerEvent("click", { point: coord, e: e });
            });
            this.mapControl.maploadcallbreak=function(){
                me.triggerEventOrFutureOnce("load",{sender:me});
            };

            this.model.addEventListener("centerChange", function (e) {
                me.triggerEvent("centerChange", { sender: me, center: e.center });
            });

            this.defaultToolManager = new HTMap.ToolManager(this, [new HTMap.PanTool("pan")]);
            this.defaultToolManager.setDefaultTool("pan");
            this.defaultToolManager.switchTool("pan");
            this.dblClickZoom = false;
            this.enableDrag = true;

            Event.observe(window,"resize",function(){me.setCenter(me.getCenter(),me.getZoom());});
        },

        getContainer: function () {
            return this.container;
        },

        setCenter: function (centerPoint, level) {
            level = typeof (level) == "number" ? level : this.model.getZoom().getLevel();
            this.model.defaultCenterPoint = centerPoint;
            this.model.DefaultLevel = level;
            this.model.setViewCenterCoord(centerPoint.getCoord());
            this.setZoom(level);
        },
        ScrollWheelZoom: false,
        map_mousemove: function (e) {
            var coord = Util.getCoordinateByPixel2(Util.getMousePixel(e), this.model.getZoom(), this).getPoint();
            this.triggerEvent("mousemove", { point: coord, e: e });
        },

        _lastWheelTime: new Date(),
        _lastTimeOutZoomF: null,
        _WheelLgCount: 0,
        map_mousewheel: function (e) {
            if (!this.ScrollWheelZoom) return;
            var d = 300;
            if (this._lastTimeOutZoomF && window.event.timeStamp - this._lastWheelTime < d && this._WheelLgCount < 20) {
                clearTimeout(this._lastTimeOutZoomF);
                this._WheelLgCount++;
            }
            var _zoomIn = window.event.wheelDelta > 0;
            var me = this;
            var eventSave = { clientX: e.clientX, clientY: e.clientY, pageX: e.pageX, pageY: e.pageY }; //IE中到执行的时候会丢失这部分数据
            this._lastTimeOutZoomF = setTimeout(function () {
                (function (zoomIn) {
                    this._WheelLgCount = 0;
                    var level = this.model.getZoom().getLevel();
                    var c = Util.getCoordinateByPixel2(Util.getMousePixel(eventSave), this.model.getZoom(), this).getPoint();
                    if (zoomIn && level < HTMap.mapConfig.MaxZoomLevel) {
                        level += 1
                        this.setCenter(c, level);
                    }
                    else if (!zoomIn && level > HTMap.mapConfig.MinZoomLevel) {
                        level -= 1
                        this.setCenter(c, level);
                    }
                }).apply(me, [_zoomIn]);
            }, d);
            this._lastWheelTime = window.event.timeStamp;
        },

        map_keydown: function (e) {
            if (!this._enableKeyboard) return;
            switch (e.keyCode || e.which || e.charCode) {
                case 38:
                    this.panBy(0, 15); //上
                    break;
                case 39:
                    this.panBy(-15, 0); //右
                    break;
                case 40:
                    this.panBy(0, -15); //下
                    break;
                case 37:
                    this.panBy(15, 0); //左
                    break;
            }
        },

        addMapType: function (type, isCurrent) {
            if (isCurrent) {
                this.model.setCurrentMapType(type);
            }
            this.model.mapTypeIds.push(type.typeId)
            this.model.mapTypes[type.typeId] = type;
            type.paint(this.model, this.container);
        },

        addOverLayer: function (layer) {
            layer.insert(this);
        },

        clearOverlays: function () {
            if (this.model && this.model.overlays)
                for (var i = this.model.overlays.length - 1; i >= 0; i--) {
                    var o = this.model.overlays[i];
                    if (o.enableMassClear) {
                        o.remove();
                    }
                }
        },

        removeOverlay: function (overlay) {
            overlay.remove();
        },

        addControl: function (control) {
            control.map = this;
            control.paint(this.model);
            this.model.controls[control.id] = control;
        },

        addToolBar: function (toolbar) {
            toolbar.setMap(this);
            toolbar.registerEventToMap(this.mapControl.mapDiv);
            this.ToolBar = toolbar;
        },

        //禁用地图拖拽。
        disableDragging: function () {
            this.enableDrag = false;
        },
        //启用地图拖拽，默认启用。
        enableDragging: function () {
            this.enableDrag = true;
        },
        //启用滚轮放大缩小，默认禁用。
        enableScrollWheelZoom: function () {
            this.ScrollWheelZoom = true;
        },
        //禁用滚轮放大缩小。
        disableScrollWheelZoom: function () {
            this.ScrollWheelZoom = false;
        },
        //启用双击放大，默认启用。
        enableDoubleClickZoom: function () {
            this.dblClickZoom = true;
        },
        //禁用用双击放大
        disableDoubleClickZoom: function () {
            this.dblClickZoom = false;
        },
        //开启键盘方向键的操作效果
        enableKeyboard: function () {
            this._enableKeyboard = true;
        },
        //禁用键盘方向键的操作效果
        disableKeyboard: function () {
            this._enableKeyboard = false;
        },
        //启用地图惯性拖拽，默认禁用。
        enableInertialDragging: function () {
            this._enableInertialDragging = true;
        },
        //关闭习惯性拖曳
        disableInertialDragging: function () {
            this._enableInertialDragging = false;
        },

        /*enableContinuousZoom/disableContinuousZoom连续缩放效果未实现*/
        /*enablePinchToZoom/disablePinchToZoom手指缩放未实现*/
        /*enableAutoResize/disableAutoResize自动适应容器尺寸变化固定启用*/

        //设置地图默认的鼠标指针样式。参数cursor应符合CSS的cursor属性规范。
        setDefaultCursor: function (cursorString) {
            this.container.style.cursor = cursorString;
        },
        //返回地图默认的鼠标指针样式。
        getDefaultCursor: function () {
            return this.container.style.cursor;
        },
        //设置拖拽地图时的鼠标指针样式。参数cursor应符合CSS的cursor属性规范。
        setDraggingCursor: function (cursorString) {
            var t = this.ToolBar.tools['pan'];
            t.cursorStyle = cursorString;
        },
        //返回拖拽地图时的鼠标指针样式。
        getDraggingCursor: function () {
            return this.ToolBar.tools['pan'].cursorStyle;
        },
        //设置地图允许的最小级别。取值不得小于地图类型所允许的最小级别。
        setMinZoom: function (zoomNumber) {
            HTMap.mapConfig.MinZoomLevel = zoomNumber;
        },
        //设置地图允许的最大级别。取值不得大于地图类型所允许的最大级别。
        setMaxZoom: function (zoomNumber) {
            HTMap.mapConfig.MaxZoomLevel = zoomNumber;
        },

        //返回地图可视区域，以地理坐标表示。
        getBounds: function () {
            return this.model.getZoom().getViewBoundByCenter(this.container,this.model.getViewCenterCoord());
        },
        //返回地图当前中心点。
        getCenter: function () {
            return this.model.getViewCenterCoord().getPoint();
        },
        //返回两点之间的距离，单位是米。
        getDistance: function (point1, point2) {
            Util.distanceByLnglat(point1.x, point1.y, point2.x, point2.y);
        },
        //返回地图类型。
        getMapType: function () {
            return this.model.getCurrentMapType();
        },
        //返回地图视图的大小，以像素表示。
        getSize: function () {
            return { width: this.container.clientWidth, height: this.container.clientHeight };
        },
        //根据提供的地理区域或坐标获得最佳的地图视野，返回的对象中包含center和zoom属性，分别表示地图的中心点和级别。此方法仅返回视野信息，不会将新的中心点和级别做用到当前地图上。
        /*getViewport(view: Array<Point>[, viewportOptions: ViewportOptions])未实现*/

        //返回地图当前缩放级别。
        getZoom: function () {
            return this.model.getZoom().getLevel();
        },

        //设置地图缩放级别
        setZoom: function (zoomNumber) {
            if (zoomNumber <= HTMap.mapConfig.MaxZoomLevel && zoomNumber >= HTMap.mapConfig.MinZoomLevel) {
                var changed = !this.model.getZoom() || (zoomNumber != this.model.getZoom().getLevel());
                this.model.setZoom(new HTMap.Zoom(zoomNumber));
                this.mapControl.paint(this.model, true, true);
                this.level = zoomNumber;
                if (changed) this.triggerEvent("ZoomChanged", zoomNumber);
            }
        },

        //设置中心点和缩放等级
        centerAndZoom: function (centerPoint, zoomNumber) {
            this.setCenter(centerPoint, zoomNumber);
        },

        /*panTo(center:Point[, opts:PanOptions])以平滑动画的方式移动到中心点位置。未实现*/

        //将地图在水平位置上移动x像素，垂直位置上移动y像素。如果指定的像素大于可视区域范围或者在配置中指定没有动画效果，则不执行滑动效果。
        panBy: function (xNumber, yNumber, PanOptions) {
            PanOptions = PanOptions || { noAnimation: true };
            if (typeof (PanOptions.noAnimation) == 'undefined') PanOptions.noAnimation = true;
            if (PanOptions.noAnimation) {
                this.mapControl.mapDiv.style.left = Util.getValueOfNoPX(this.mapControl.mapDiv.style.left) + xNumber + "px";
                this.mapControl.mapDiv.style.top = Util.getValueOfNoPX(this.mapControl.mapDiv.style.top) + yNumber + "px";
                this.mapControl.rPaintWithDivChanged(this.model);
            }
            else {
                //使用动画滑动效果来平移地图
                var me = this;
                var sx = Util.getValueOfNoPX(this.mapControl.mapDiv.style.left);
                var sy = Util.getValueOfNoPX(this.mapControl.mapDiv.style.top);
                var div = this.mapControl.mapDiv;
                Util.setInterval(100, 10, function (args) {
                        div.style.left = args.x + "px";
                        div.style.top = args.y + "px";
                    }, { x: sx, y: sy }, { x: sx + xNumber, y: sy + yNumber },
                    function () {
                        me.mapControl.rPaintWithDivChanged(me.model);
                    });
            }
        },

        /*reset重新设置地图，恢复地图初始化时的中心点和级别。未实现*/

        /*setCenter已实现*/

        /*setCurrentCity设置地图城市，注意当地图初始化时的类型设置.未实现*/

        //根据提供的地理区域或坐标设置地图视野，调整后的视野会保证包含提供的地理区域或坐标。{x,y}格式的点数组
        setViewport: function (ArrayPoint) {
            if (!ArrayPoint || ArrayPoint.length == 0) return;
            var top = Number.MAX_VALUE, bottom = Number.MIN_VALUE, left = Number.MAX_VALUE, right = Number.MIN_VALUE;
            for (var j = 0; j < ArrayPoint.length; j++) {
                var p = ArrayPoint[j];
                top = top < p.y ? top : p.y;
                bottom = bottom > p.y ? bottom : p.y;
                left = left < p.x ? left : p.x;
                right = right > p.x ? right : p.x;
            }
            var leftTop = new HTMap.Coordinate(left, top);
            var rightbottom = new HTMap.Coordinate(right, bottom);
            var rect = new HTMap.Rectangle(leftTop.x / 1e16, rightbottom.x / 1e16, leftTop.y / 1e16, rightbottom.y / 1e16);
            var zoomToExtent = function (model, extent, container, direction) {
                if (extent) {
                    var zoom = model.getZoom();

                    var w1 = zoom.getViewBound(container).getPixelWidth(zoom);
                    var h1 = zoom.getViewBound(container).getPixelHeight(zoom);
                    var w2 = extent.getPixelWidth(zoom);
                    var h2 = extent.getPixelHeight(zoom);
                    var r1 = Math.sqrt(w1 * w1 + h1 * h1);
                    var r2 = Math.sqrt(w2 * w2 + h2 * h2);
                    var deltalLevel = Math.floor(r1 / r2);
                    if (w2 < 1 || h2 < 1)
                        return;
                    var orgLevel = zoom.getLevel();
                    if (deltalLevel > 3) deltalLevel = 3;
                    switch (direction) {
                        case 'zoomin':
                            orgLevel += deltalLevel;
                            if (orgLevel > HTMap.mapConfig.MaxZoomLevel) orgLevel = HTMap.mapConfig.MaxZoomLevel;
                            break;
                        case 'zoomout':
                            orgLevel -= deltalLevel;
                            if (orgLevel < 1) orgLevel = 1;
                            break;
                    }
                    model.setZoom(new HTMap.Zoom(orgLevel));
                    model.setViewCenterCoord(extent.getCenter());
                    model.controls[container.childNodes[0].id].paint(model, true);
                    model.controls[model.ovId].paint(model);
                    Prototype.$('sliderbar_' + model.getId()).parentNode.style.top = ((HTMap.mapConfig.MaxZoomLevel - orgLevel) * 12 + 6) + "px"
                }
            }
            zoomToExtent(this.model, rect, this.mapControl.mapDiv.parentNode, "zoomin");
        },

        /**
         * 添加热区到地图上
         * @param hotspot
         */
        addHotspot: function (hotspot) {
            hotspot.addToMap(this);
        }
    };
})();
(function () {
    HTMap.ControlAnchor = {
        ANCHOR_TOP_LEFT: 0,
        ANCHOR_TOP_RIGHT: 1,
        ANCHOR_BOTTOM_LEFT: 2,
        ANCHOR_BOTTOM_RIGHT: 3
    };
    //Abstract Control class
    Abstract.Control = function () { }
    Abstract.Control.prototype = {
        initialize: function () {

        },

        map: null,

        paint: function () {
        },
        firstload:true,

        loadTiles: function (model, container, mapDiv, isTracing, rloadOverlays) {
            var curZoom = model.getZoom();
            //获取当前地图范围内应该显示的瓦片集合
            var tiles = curZoom.getTiles(model, container);
            var oldTiles = new Array();
            //获取目前地图上已经加载的瓦片和覆盖物
            var tileDivs = mapDiv.childNodes;

            if (this.triggerEvent) this.triggerEvent("loadTiles", { sender: this });

            if (isTracing) {
                model.traces[model.traceIndex] = { coord: model.getViewCenterCoord(), level: curZoom.getLevel() };
                model.traceIndex += 1;
                model.curIndex = model.traceIndex - 1;
            }

            var n = 0;
            //将地图上的瓦片和覆盖物添加到oldtiles中
            if (tileDivs) {
                for (var i = 0; i < tileDivs.length; i++) {
                    oldTiles.push(tileDivs[i]);
                }
            }
            //瓦片的id规则
            var getTileId = function (t) {
                return "map_" + model.getId() + "_zoom_" + model.getZoom().getLevel() + "_tile_" + t.getRow() + "_" + t.getColumn();
            }
            //在已有的瓦片中查找
            var findTiles = function (t) {
                if (!oldTiles) return;
                var tileId = getTileId(t);
                //查找当前瓦片是否已经存在于旧有的瓦片中
                for (var j = 0; j < oldTiles.length; j++) {
                    if (oldTiles[j] != null && oldTiles[j].getAttribute && oldTiles[j].getAttribute("id") == tileId) {
                        return { div: oldTiles[j], index: j }
                    }
                }
            }
            var loadDs=[];
            //加载瓦片
            function loadTile(tileObj) {
                var me = this;
                if (!tileObj) return;
                var oldTile = findTiles(tileObj);
                //如果当前瓦片不存在与旧有瓦片中
                if (!oldTile) {
                    //加载该瓦片
                    var tpx = Util.getPixelByTileXY(tileObj.getColumn(), tileObj.getRow());
                    var deltaX = tpx.x;
                    var deltaY = tpx.y;
                    var tile = document.createElement("div");
                    tile.id = getTileId(tileObj);
                    tile.style.position = "absolute";
                    tile.style.left = deltaX + "px";
                    tile.style.top = deltaY + "px";
                    tile.onmousedown = null;
                    mapDiv.appendChild(tile);
                    var imgs = tileObj.getSrc().split('|');
                    for (var t = 0; t < imgs.length; t++) {
                        if (!imgs[t]) continue;
                        var tileImage = document.createElement("img");
                        //瓦片DIV
                        var imgsrc = imgs[t];
                        var errorf =
                            tileImage.onerror = this.OnImgError(this);
                        tileImage.src = imgsrc;
                        tileImage.galleryImg = 'no';
                        tileImage.onmousedown = null;
                        tileImage.style.position = 'absolute';
                        tile.appendChild(tileImage);
                        if(this.firstload){
                            var d={r:function(){this.rd=true;this.sr && this.sr();},sr:null,rd:false,setSr:function(sr){if(this.rd){sr();}else{this.sr=sr;}}};
                            if(tileImage.complete){d.r()}else{tileImage.onload=function(){d.r()}}
                            var nef = tileImage.onerror;
                            tileImage.onerror = function(){d.r(); nef();}
                            loadDs.push(d);
                        }
                    }
                    n++;
                }
                else {
                    //如果本瓦片已经加载了，需要修正其位置
                    var tpx = Util.getPixelByTileXY(tileObj.getColumn(), tileObj.getRow());
                    var deltaX = tpx.x;
                    var deltaY = tpx.y;
                    oldTile.div.style.left = deltaX + "px";
                    oldTile.div.style.top = deltaY + "px";
                    oldTiles[oldTile.index] = null; //防止该旧div被删除
                }
            }
            if (tiles) {
                var max = tiles.length;
                var midIndex = parseInt(max / 2);
                var cs = 0;
                for (var i = midIndex, f = 1; cs < max;) {
                    var t = tiles[i];
                    loadTile.apply(this, [t]);
                    f = -f;
                    if (f == -1) cs++;
                    i = midIndex + f * cs;
                }
            }

            //id添加了Over_的div在移动地图的时候保留下来,其他旧有的DIV删除
            for (var i = 0; i < oldTiles.length; i++) {
                /*if (oldTiles[i] != null && oldTiles[i].getAttribute && oldTiles[i].getAttribute("id").indexOf("Over_") > -1) {
                 if (tiles.length == n)
                 this.resetOverlay(mapDiv, model, oldTiles[i]);
                 continue;
                 }*/
                if (oldTiles[i] != null &&
                    oldTiles[i].getAttribute &&
                    oldTiles[i].getAttribute("id").indexOf("_DrawLayer_") == -1 &&
                    oldTiles[i].getAttribute("id").indexOf("Over_") == -1
                ) {
                    mapDiv.removeChild(oldTiles[i]);
                }
            }
            //若地图瓦片全部更新了，或调用方强制刷新所有的覆盖物
            if ((rloadOverlays || tiles.length == n) && model.overlays) {
                for (var a = 0, b = model.overlays.length; a < b; a++) {
                    model.overlays[a].setToMap();
                }
            }

            oldTiles = null;
            tiles = null;
            tileDivs = null;

            //绘制层
            var id = "_DrawLayer_" + this.id;
            var d = document.getElementById(id);
            if (!d) {
                d = document.createElement("div");
                d.id = id;
                d.style.zIndex = 200;
                d.style.width = "100%";
                d.style.height = "100%";
                d.style.position = "absolute";
                d.style.overflow = "visible";
                this.mapDiv && this.mapDiv.appendChild(d);
                this.drawPaper = Raphael(d, "100%", "100%");
            }

            if(this.firstload){
                var me = this;
                var count = loadDs.length,loadCount=0;
                for(var i= 0;i<count;i++){
                    loadDs[i].setSr(function(){
                        loadCount++;
                        if(loadCount==count){
                            me.maploadcallbreak && me.maploadcallbreak();
                        }
                    });
                }
                this.firstload=false;
            }
        },

        OnImgError: function (me) {
            return function () {
                var img = event.srcElement;
                if (!img) return;
                img.onerror = null;
                if (me.opts) {
                    img.src = me.opts.NotFoundImg;
                }
                else {
                    //img.remove();
                    //img.parentElement.removeChild(img);
                    img.style.display = "none";
                    //setTimeout(function () { img.parentElement.removeChild(img); }, 1);
                }
            }
        },

        resetOverlay: function (mapDiv, model, div) {//本方法原意为更新指定的覆盖物，但已被改为统一遍历更新所有覆盖物，本方法没有被使用
            if (div) {
                for (var i = 0; i < model.overlays.length; i++) {
                    if (model.overlays[i].id == div.id) {
                        model.overlays[i].setToMap();
                        break;
                    }
                }
            }
        },

        show: function () {
            if (this.div) this.div.style.display = "";
        },

        hide: function () {
            if (this.div) this.div.style.display = "none";
        },

        isVisible: function () {
            return this.div && this.div.style.display != "none";
        },

        offset: { width: 0, height: 0 },

        setOffset: function (offset) {
            this.offset = offset;
            if (this.anchor == HTMap.ControlAnchor.ANCHOR_BOTTOM_LEFT) {
                //左下角
                this.div.style.top = "";
                this.div.style.right = "";
                this.div.style.left = offset.width + 'px';
                this.div.style.bottom = offset.height + 'px';
            }
            else if (this.anchor == HTMap.ControlAnchor.ANCHOR_BOTTOM_RIGHT) {
                //右下角
                this.div.style.top = "";
                this.div.style.left = "";
                this.div.style.bottom = offset.height + "px";
                this.div.style.right = offset.width + "px";
            }
            else if (this.anchor == HTMap.ControlAnchor.ANCHOR_TOP_LEFT) {
                //左上角
                this.div.style.bottom = "";
                this.div.style.right = "";
                this.div.style.left = offset.width + "px";
                this.div.style.top = offset.height + "px";
            }
            else if (this.anchor == HTMap.ControlAnchor.ANCHOR_TOP_RIGHT) {
                //右上角
                this.div.style.bottom = "";
                this.div.style.left = "";
                this.div.style.top = offset.height + "px";
                this.div.style.right = offset.width + "px";
            }
        },

        getOffset: function () { return this.offset; },

        anchor: HTMap.ControlAnchor.ANCHOR_TOP_LEFT,

        /**
         * 设置控件停靠的位置
         * @param anchor
         */
        setAnchor: function (anchor) {
            this.anchor = anchor;
            this.setOffset(this.offset);
        },

        getAnchor: function () { return this.anchor; }
    };

})();
(function(){
    Abstract.OverLayer = Class.create();
    Abstract.OverLayer.prototype = {
        initialize: function () {
            this.enableMassClear = true;
            this.isRaphaelObject = true;
            this.Events = {};
            this._pauseEvents = {};
        },

        addEventListener : function (eventName, handler) {
            if (!this.Events) return;
            if (!this.Events["Event_" + eventName]) {
                this.Events["Event_" + eventName] = [];
            }
            this.Events["Event_" + eventName].push(handler);
        },
        triggerEvent : function (eventName, args) {
            if (!this.Events) return true;
            var events = this.Events["Event_" + eventName]
            if (events) {
                if (this._pauseEvents[eventName] && this._pauseEvents[eventName] > 0) {
                    this._pauseEvents[eventName]--;
                    return true;
                }
                for (var i = 0; i < events.length; i++) {
                    /*事件处理函数可以通过返回false来终止事件的执行并将此值返回给触发事件的代码*/
                    if (events[i](args) == false) return false;
                }
            }
            return true;//返回true表示没有事件处理函数或者所有的事件处理函数完成了处理
        },
        removeEventListener : function (eventName, handler) {
            if (!this.Events) return;
            var e = this.Events["Event_" + eventName];
            if (e) {
                for (var i = 0; i < e.length; i++) {
                    if (e[i] == handler) {
                        e.splice(i, 1);
                        return;
                    }
                }
            }
        },
        pauseEvent : function (eventName) {
            this._pauseEvents[eventName] = 1;
        },

        insert: function (map) {
            this.map = map;
            this.mapDiv = this.mapDiv || Prototype.$(map.mapControl.id);
            this.model = this.model || map.model;

            if (this.model == null)
                return;
            if (this.model.overlays == null)
                this.model.overlays = new Array();
            this.model.overlays.push(this);
            this.drawPaper = map.mapControl.drawPaper;
            this.setToMap(map);
            Event.observe(this.div, "click", function (e) {
                Event.stop(e);
            });
            this.triggerEvent("insert", { sender: this });
        },

        remove: function () {
            if (this.removed) return;
            if (this.model == null)
                return;
            if (this.model.overlays) {
                this.model.overlays = this.model.overlays.without(this)
                if (this.div.remove) {
                    this.div.remove();
                }
                else {
                    this.mapDiv.removeChild(this.div);
                }
                this.removed = true;
            }
            this.triggerEvent("remove", { sender: this });
        },

        hide: function () {
            this.div.style.display = "none";
        },

        show: function () {
            this.div.style.display = "";
        },

        /**
         * 是否在调用map.clearOverlays清除此覆盖物，默认为true。
         * @param {Boolean} disable
         */
        disableMassClear: function (disable) {
            this.enableMassClear = !disable;
        },

        /**
         * 设置覆盖物的zIndex
         * @param {Number} index
         */
        setZIndex: function (index) {
            if (this.div) {
                this.div.style.zIndex = index;
            }
        },

        /**
         * 获取覆盖物所在的map对象
         */
        getMap: function () {
            return this.map;
        }
    };
})();

(function(){
    Abstract.GraphOverLayer = Class.create();
    Abstract.GraphOverLayer.prototype = {
        initialize:function(){
            this.enableMassClear = true;
            this.isRaphaelObject = true;
            this.Events = {};
            this._pauseEvents = {};
            this._hasFill = true;
        },
        addEventListener : function (eventName, handler) {
            if (!this.Events) return;
            if (!this.Events["Event_" + eventName]) {
                this.Events["Event_" + eventName] = [];
            }
            this.Events["Event_" + eventName].push(handler);
        },
        triggerEvent : function (eventName, args) {
            if (!this.Events) return true;
            var events = this.Events["Event_" + eventName]
            if (events) {
                if (this._pauseEvents[eventName] && this._pauseEvents[eventName] > 0) {
                    this._pauseEvents[eventName]--;
                    return true;
                }
                for (var i = 0; i < events.length; i++) {
                    /*事件处理函数可以通过返回false来终止事件的执行并将此值返回给触发事件的代码*/
                    if (events[i](args) == false) return false;
                }
            }
            return true;//返回true表示没有事件处理函数或者所有的事件处理函数完成了处理
        },
        removeEventListener : function (eventName, handler) {
            if (!this.Events) return;
            var e = this.Events["Event_" + eventName];
            if (e) {
                for (var i = 0; i < e.length; i++) {
                    if (e[i] == handler) {
                        e.splice(i, 1);
                        return;
                    }
                }
            }
        },
        pauseEvent : function (eventName) {
            this._pauseEvents[eventName] = 1;
        },

        insert: function (map) {
            this.map = map;
            this.mapDiv = this.mapDiv || Prototype.$(map.mapControl.id);
            this.model = this.model || map.model;

            if (this.model == null)
                return;
            if (this.model.overlays == null)
                this.model.overlays = new Array();
            this.model.overlays.push(this);
            this.drawPaper = map.mapControl.drawPaper;
            this.setToMap(map);
            Event.observe(this.div, "click", function (e) {
                Event.stop(e);
            });
            this.triggerEvent("insert", { sender: this });
        },

        remove: function () {
            if (this.removed) return;
            if (this.model == null)
                return;
            if (this.model.overlays) {
                this.model.overlays = this.model.overlays.without(this)
                if (this.div.remove) {
                    this.div.remove();
                }
                else {
                    this.mapDiv.removeChild(this.div);
                }
                this.removed = true;
            }
            this.triggerEvent("remove", { sender: this });
        },

        /**
         * 是否在调用map.clearOverlays清除此覆盖物，默认为true。
         * @param {Boolean} disable
         */
        disableMassClear: function (disable) {
            this.enableMassClear = !disable;
        },

        /**
         * 设置覆盖物的zIndex
         * @param {Number} index
         */
        setZIndex: function (index) {
            if (this.div) {
                this.div.style.zIndex = index;
            }
        },

        /**
         * 获取覆盖物所在的map对象
         */
        getMap: function () {
            return this.map;
        },
        hide:function(){
            this.div.hide();
        },
        show:function(){
            this.div.show();
        },
        setToMap:function(map){
            this.map = map;
            if (!this.div) {
                this.CreateDiv();
                this.initEvent();
            }
            this.UpdateGeometry();
            this.UpdateSymbol();
        },
        buildExtent: function () {
            var minX = 180e16, maxX = 0, minY = 90e16, maxY = 0;

            for (var i = 0; i < this.points.length; i++) {
                if (this.points[i].getCoord().x < minX) minX = this.points[i].getCoord().x;
                if (this.points[i].getCoord().x > maxX) maxX = this.points[i].getCoord().x;
                if (this.points[i].getCoord().y < minY) minY = this.points[i].getCoord().y;
                if (this.points[i].getCoord().y > maxY) maxY = this.points[i].getCoord().y;
            }
            return this.bound = new HTMap.Bound(minX, maxX, minY, maxY);
        },
        getExtent: function () {
            return this.buildExtent();
        },
        initEvent:function(){
            if(!this.enableClicking)return;
            var me=this;
            this.div.click(function(e){
                me.triggerEvent("click", { sender: me, e: e });
            });
            this.div.mouseover(function(e){
                me.triggerEvent("mouseover", { sender: me, e: e });
            });
            this.div.mouseout(function(e){
                me.triggerEvent("mouseout", { sender: me, e: e });
            });
            this.div.touchstart(function(e){
                me.triggerEvent("touchstart", { sender: me, e: e });
                me.triggerEvent("click", { sender: me, e: e });
            });
        },
        CreateDiv:function(){},
        UpdateGeometry:function(){},
        UpdateSymbol:function(){
            if(this.div){
                var style = {
                    "stroke": this.strokeColor,
                    "stroke-width": this.strokeWeight,
                    "stroke-opacity": this.strokeOpacity,
                    "stroke-dasharray": this.strokeStyle,
                    "cursor":this.enableClicking?"pointer":""
                };
                if(this._hasFill){
                    style["fill"] = this.fillColor;
                    style["fill-opacity"] = this.fillOpacity;
                }
                this.div.attr(style);
            }
        },
        /**
         * 修改指定位置的坐标。索引index从0开始计数。
         * @param index
         * @param point
         */
        setPositionAt: function (index, point) {
            this.points[index] = point;
            this.UpdateGeometry();
        },
        /**
         * 设置图形的点数组
         * @param points
         */
        setPath: function (points) {
            this.points = points;
            this.UpdateGeometry();
        },
        /**
         * 返回图形的点数组
         * @return {*}
         */
        getPath: function () {
            return this.points;
        },
        /**
         * 设置图形的边线颜色，参数为合法的CSS颜色值。
         * @param color
         */
        setStrokeColor: function (color) {
            this.strokeColor = color;
            if (this.div) {
                this.div.attr("stroke", this.strokeColor);
            }
        },
        /**
         * 返回图形的边线颜色。
         * @return {*}
         */
        getStrokeColor: function () {
            return this.strokeColor;
        },
        /**
         * 设置图形的填充颜色，参数为合法的CSS颜色值。
         * @param color
         */
        setFillColor: function (color) {
            if(!this._hasFill)throw "Not supported";
            this.fillColor = color;
            if (this.div) {
                this.div.attr("fill", this.fillColor);
            }
        },
        /**
         * 返回图形的填充颜色。
         * @return {*}
         */
        getFillcolor: function () {
            return this.fillColor;
        },
        /**
         * 设置图形的边线透明度，取值范围0 - 1。
         * @param opacity
         */
        setStrokeOpacity: function (opacity) {
            this.strokeOpacity = opacity;
            if (this.div) {
                this.div.attr("stroke-opacity", this.strokeOpacity);
            }
        },
        /**
         * 返回图形的边线透明度。
         * @return {*}
         */
        getStrokeOpacity: function () {
            return this.strokeOpacity;
        },
        /**
         * 设置图形的填充透明度，取值范围0 - 1。
         * @param opacity
         */
        setFillOpacity: function (opacity) {
            if(!this._hasFill)throw "Not supported";
            this.fillOpacity = opacity;
            if (this.div) {
                this.div.attr("fill-opacity", this.fillOpacity);
            }
        },
        /**
         * 返回图形的填充透明度。
         * @return {*}
         */
        getFillOpacity: function () {
            return this.fillOpacity;
        },
        /**
         * 设置图形边线的宽度，取值为大于等于1的整数。
         * @param weight
         */
        setStrokeWeight: function (weight) {
            this.strokeWeight = weight;
            if (this.div) {
                this.div.attr("stroke-width", this.strokeWeight);
            }
        },
        /**
         * 返回图形边线的宽度。
         * @return {*}
         */
        getStrokeWeight: function () {
            return this.strokeWeight;
        },
        /**
         * 设置图形边线样式
         * @param style
         */
        setStrokeStyle: function (style) {
            this.strokeStyle = style;
            if (this.div) {
                this.div.attr("stroke-dasharray", this.strokeStyle);
            }
        },
        /**
         * 返回图形边线样式。
         * @return {*}
         */
        getStrokeStyle: function () {
            return this.strokeStyle;
        },
        /**
         * 返回覆盖物的地理区域范围。
         * @return {*}
         */
        getBounds: function () {
            return this.buildExtent();
        }
    };
})();

(function () {
    Abstract.Tool = function () { }
    Abstract.Tool.prototype = {
        initialize: function (id, opts) {
            this.toolType = "Tool";
            this.id = id;
            Util.setClassEvent(this);
            Util.setOptionsValue(this, opts, {});
        },
        OnSelect: function () { },
        ClearSelect: function () { },
        mouseDownHandler: function (e, toolManager) { Event.stop(e); },
        mouseUpHandler: function (e, toolManager) { Event.stop(e); },
        mouseMoveHandler: function (e, toolManager) { },
        clickHandler: function (e, toolManager) { Event.stop(e); },
        dblClickHandler: function (e, toolManager) { Event.stop(e); },

        touchstart:function(e){},
        touchend:function(e){},
        touchmove:function(e){},
        touchcancel:function(e){}
    };
})();
(function () {
    HTMap.ControlAnchor = {
        ANCHOR_TOP_LEFT: 0,
        ANCHOR_TOP_RIGHT: 1,
        ANCHOR_BOTTOM_LEFT: 2,
        ANCHOR_BOTTOM_RIGHT: 3
    };
    //Abstract Control class
    Abstract.Control = function () { }
    Abstract.Control.prototype = {
        initialize: function () {

        },

        map: null,

        paint: function () {
        },
        firstload:true,

        loadTiles: function (model, container, mapDiv, isTracing, rloadOverlays) {
            var curZoom = model.getZoom();
            //获取当前地图范围内应该显示的瓦片集合
            var tiles = curZoom.getTiles(model, container);
            var oldTiles = new Array();
            //获取目前地图上已经加载的瓦片和覆盖物
            var tileDivs = mapDiv.childNodes;

            if (this.triggerEvent) this.triggerEvent("loadTiles", { sender: this });

            if (isTracing) {
                model.traces[model.traceIndex] = { coord: model.getViewCenterCoord(), level: curZoom.getLevel() };
                model.traceIndex += 1;
                model.curIndex = model.traceIndex - 1;
            }

            var n = 0;
            //将地图上的瓦片和覆盖物添加到oldtiles中
            if (tileDivs) {
                for (var i = 0; i < tileDivs.length; i++) {
                    oldTiles.push(tileDivs[i]);
                }
            }
            //瓦片的id规则
            var getTileId = function (t) {
                return "map_" + model.getId() + "_zoom_" + model.getZoom().getLevel() + "_tile_" + t.getRow() + "_" + t.getColumn();
            }
            //在已有的瓦片中查找
            var findTiles = function (t) {
                if (!oldTiles) return;
                var tileId = getTileId(t);
                //查找当前瓦片是否已经存在于旧有的瓦片中
                for (var j = 0; j < oldTiles.length; j++) {
                    if (oldTiles[j] != null && oldTiles[j].getAttribute && oldTiles[j].getAttribute("id") == tileId) {
                        return { div: oldTiles[j], index: j }
                    }
                }
            }
            var loadDs=[];
            //加载瓦片
            function loadTile(tileObj) {
                var me = this;
                if (!tileObj) return;
                var oldTile = findTiles(tileObj);
                //如果当前瓦片不存在与旧有瓦片中
                if (!oldTile) {
                    //加载该瓦片
                    var tpx = Util.getPixelByTileXY(tileObj.getColumn(), tileObj.getRow());
                    var deltaX = tpx.x;
                    var deltaY = tpx.y;
                    var tile = document.createElement("div");
                    tile.id = getTileId(tileObj);
                    tile.style.position = "absolute";
                    tile.style.left = deltaX + "px";
                    tile.style.top = deltaY + "px";
                    tile.onmousedown = null;
                    mapDiv.appendChild(tile);
                    var imgs = tileObj.getSrc().split('|');
                    for (var t = 0; t < imgs.length; t++) {
                        if (!imgs[t]) continue;
                        var tileImage = document.createElement("img");
                        //瓦片DIV
                        var imgsrc = imgs[t];
                        var errorf =
                            tileImage.onerror = this.OnImgError(this);
                        tileImage.src = imgsrc;
                        tileImage.galleryImg = 'no';
                        tileImage.onmousedown = null;
                        tileImage.style.position = 'absolute';
                        tile.appendChild(tileImage);
                        if(this.firstload){
                            var d={r:function(){this.rd=true;this.sr && this.sr();},sr:null,rd:false,setSr:function(sr){if(this.rd){sr();}else{this.sr=sr;}}};
                            if(tileImage.complete){d.r()}else{tileImage.onload=function(){d.r()}}
                            var nef = tileImage.onerror;
                            tileImage.onerror = function(){d.r(); nef();}
                            loadDs.push(d);
                        }
                    }
                    n++;
                }
                else {
                    //如果本瓦片已经加载了，需要修正其位置
                    var tpx = Util.getPixelByTileXY(tileObj.getColumn(), tileObj.getRow());
                    var deltaX = tpx.x;
                    var deltaY = tpx.y;
                    oldTile.div.style.left = deltaX + "px";
                    oldTile.div.style.top = deltaY + "px";
                    oldTiles[oldTile.index] = null; //防止该旧div被删除
                }
            }
            if (tiles) {
                var max = tiles.length;
                var midIndex = parseInt(max / 2);
                var cs = 0;
                for (var i = midIndex, f = 1; cs < max;) {
                    var t = tiles[i];
                    loadTile.apply(this, [t]);
                    f = -f;
                    if (f == -1) cs++;
                    i = midIndex + f * cs;
                }
            }

            //id添加了Over_的div在移动地图的时候保留下来,其他旧有的DIV删除
            for (var i = 0; i < oldTiles.length; i++) {
                /*if (oldTiles[i] != null && oldTiles[i].getAttribute && oldTiles[i].getAttribute("id").indexOf("Over_") > -1) {
                 if (tiles.length == n)
                 this.resetOverlay(mapDiv, model, oldTiles[i]);
                 continue;
                 }*/
                if (oldTiles[i] != null &&
                    oldTiles[i].getAttribute &&
                    oldTiles[i].getAttribute("id").indexOf("_DrawLayer_") == -1 &&
                    oldTiles[i].getAttribute("id").indexOf("Over_") == -1
                ) {
                    mapDiv.removeChild(oldTiles[i]);
                }
            }
            //若地图瓦片全部更新了，或调用方强制刷新所有的覆盖物
            if ((rloadOverlays || tiles.length == n) && model.overlays) {
                for (var a = 0, b = model.overlays.length; a < b; a++) {
                    model.overlays[a].setToMap();
                }
            }

            oldTiles = null;
            tiles = null;
            tileDivs = null;

            //绘制层
            var id = "_DrawLayer_" + this.id;
            var d = document.getElementById(id);
            if (!d) {
                d = document.createElement("div");
                d.id = id;
                d.style.zIndex = 200;
                d.style.width = "100%";
                d.style.height = "100%";
                d.style.position = "absolute";
                d.style.overflow = "visible";
                this.mapDiv && this.mapDiv.appendChild(d);
                this.drawPaper = Raphael(d, "100%", "100%");
            }

            if(this.firstload){
                var me = this;
                var count = loadDs.length,loadCount=0;
                for(var i= 0;i<count;i++){
                    loadDs[i].setSr(function(){
                        loadCount++;
                        if(loadCount==count){
                            me.maploadcallbreak && me.maploadcallbreak();
                        }
                    });
                }
                this.firstload=false;
            }
        },

        OnImgError: function (me) {
            return function () {
                var img = event.srcElement;
                if (!img) return;
                img.onerror = null;
                if (me.opts) {
                    img.src = me.opts.NotFoundImg;
                }
                else {
                    //img.remove();
                    //img.parentElement.removeChild(img);
                    img.style.display = "none";
                    //setTimeout(function () { img.parentElement.removeChild(img); }, 1);
                }
            }
        },

        resetOverlay: function (mapDiv, model, div) {//本方法原意为更新指定的覆盖物，但已被改为统一遍历更新所有覆盖物，本方法没有被使用
            if (div) {
                for (var i = 0; i < model.overlays.length; i++) {
                    if (model.overlays[i].id == div.id) {
                        model.overlays[i].setToMap();
                        break;
                    }
                }
            }
        },

        show: function () {
            if (this.div) this.div.style.display = "";
        },

        hide: function () {
            if (this.div) this.div.style.display = "none";
        },

        isVisible: function () {
            return this.div && this.div.style.display != "none";
        },

        offset: { width: 0, height: 0 },

        setOffset: function (offset) {
            this.offset = offset;
            if (this.anchor == HTMap.ControlAnchor.ANCHOR_BOTTOM_LEFT) {
                //左下角
                this.div.style.top = "";
                this.div.style.right = "";
                this.div.style.left = offset.width + 'px';
                this.div.style.bottom = offset.height + 'px';
            }
            else if (this.anchor == HTMap.ControlAnchor.ANCHOR_BOTTOM_RIGHT) {
                //右下角
                this.div.style.top = "";
                this.div.style.left = "";
                this.div.style.bottom = offset.height + "px";
                this.div.style.right = offset.width + "px";
            }
            else if (this.anchor == HTMap.ControlAnchor.ANCHOR_TOP_LEFT) {
                //左上角
                this.div.style.bottom = "";
                this.div.style.right = "";
                this.div.style.left = offset.width + "px";
                this.div.style.top = offset.height + "px";
            }
            else if (this.anchor == HTMap.ControlAnchor.ANCHOR_TOP_RIGHT) {
                //右上角
                this.div.style.bottom = "";
                this.div.style.left = "";
                this.div.style.top = offset.height + "px";
                this.div.style.right = offset.width + "px";
            }
        },

        getOffset: function () { return this.offset; },

        anchor: HTMap.ControlAnchor.ANCHOR_TOP_LEFT,

        /**
         * 设置控件停靠的位置
         * @param anchor
         */
        setAnchor: function (anchor) {
            this.anchor = anchor;
            this.setOffset(this.offset);
        },

        getAnchor: function () { return this.anchor; }
    };

})();
(function () {
    HTMap.MapControl = Class.create();
    HTMap.MapControl.prototype = Object.extend(new Abstract.Control(), {
        initialize: function (id, container, opts) {
            opts = opts || {
                    NotFoundImg: ""
                };
            this.id = id;
            this.mapDiv = Util.createDiv(id);
            this.mapDiv.style.position = "absolute";
            this.mapDiv.style.zIndex = 0;
            this.container = container;
            //this.container.style.border = "1px solid #666666";
            this.container.style.overflow = "hidden";
            this.container.style.position = "relative";
            this.container.appendChild(this.mapDiv);
            this.mapDiv.onselectstart = function () { return false; };
            Util.setClassEvent(this);
        },

        //立即重绘整个地图(保留覆盖物)
        rPaint: function (model) {
            var oldTiles = [];
            var mapDiv = this.mapDiv;
            var tileDivs = mapDiv.childNodes;
            if (tileDivs) {
                for (var i = 0; i < tileDivs.length; i++) {
                    if (tileDivs[i].getAttribute("id").indexOf("Over_") < 0) oldTiles.push(tileDivs[i]);
                }
            }
            for (var i = 0; i < oldTiles.length; i++) {
                if (oldTiles[i] != null) {
                    mapDiv.removeChild(oldTiles[i]);
                }
            }
            this.loadTiles(model, this.container, this.mapDiv);
        },

        //重新加载瓦片，重新计算当前中心点
        rPaintWithDivChanged: function (model) {
            var orgCenterCoord = model.getViewCenterCoord();
            var curZoom = model.getZoom();
            //当前中心点
            var px = {
                x: Util.getStyleWidthOrClientWidth(this.container) / 2 - Util.getValueOfNoPX(this.mapDiv.style.left),
                y: Util.getStyleHeightOrClientHeight(this.container) / 2 - Util.getValueOfNoPX(this.mapDiv.style.top)
            };
            var newCenterCoord = Util.getCoordinateByPixel(px, curZoom);
            if (!newCenterCoord.isSame(orgCenterCoord))
                model.setViewCenterCoord(newCenterCoord);
            this.loadTiles(model, this.container, this.mapDiv, true);
        },

        paint: function (model, isTracing, rloadOverlays) {
            var curZoom = model.getZoom();

            //注意此处如果容器大小过大，会导致绘图库出现问题(测试最大值不得超过6位数)
            var MAX = 100000;
            var w = curZoom.getTileCols() * HTMap.mapConfig.TileSize;
            var h = curZoom.getTileRows() * HTMap.mapConfig.TileSize;
            w = w > MAX ? MAX : w;
            h = h > MAX ? MAX : h;
            this.mapDiv.style.width = w + "px"
            this.mapDiv.style.height = h + "px"

            Util.MapCurrentOffset = curZoom.getOffsetByCenter(this.container, model.getViewCenterCoord(), w, h);
            var viewBound = curZoom.getViewBoundByCenter(this.container, model.getViewCenterCoord());
            var deltaX = -viewBound.px.x;
            var deltaY = -viewBound.px.y;
            this.mapDiv.style.left = deltaX + "px";
            this.mapDiv.style.top = deltaY + "px";

            //重绘地图
            this.loadTiles(model, this.container, this.mapDiv, isTracing, rloadOverlays);

        },

        //获取绘制层
        getDrawLayer: function () {
            var id = "Over_DrawLayer_" + this.id;
            var d = document.getElementById(id);
            return d;
        }
    });
})();
/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 12-12-15
 * Time: 上午10:33
 * To change this template use File | Settings | File Templates.
 */
(function () {
    HTMap.MapTypeControl = Class.create();
    HTMap.MapTypeControl.prototype = Object.extend(new Abstract.Control(), {
        initialize: function (container, defaultmapTypes) {
            this.container = container;
            this.drawNavControl();
            this.DefaultMapType = defaultmapTypes;
        },
        paint: function (model) {
            this.model = model;
            var me = this;
            var mapTypes = model.mapTypes;
            var mapTypeids = model.mapTypeIds;
            for (var i = 0; i < mapTypeids.length; i++) {
                var m = mapTypes[mapTypeids[i]];
                if (m.Name) {
                    var d = document.createElement('div');
                    d.id = 'MapTypeSubDiv_' + m.Name;
                    d.style.float = 'left';
                    d.style.marginLeft = '5px';
                    if (m == this.DefaultMapType) {
                        d.style.backgroundColor = 'adaaff';
                        CurrentType = m;
                    }
                    d.innerHTML = m.Name;
                    d.onclick = function () {
                        me.SetMapType(m);
                    }
                    this.navToolDiv.appendChild(d);
                }
            }
        },
        CurrentType: null,
        SetMapType: function (mt) {
            if (mt != this.CurrentType) {
                if (this.CurrentType) {
                    document.getElementById('MapTypeSubDiv_' + this.CurrentType.Name).style.backgroundColor = '#eee';
                }
                this.CurrentType = mt;
                document.getElementById('MapTypeSubDiv_' + this.CurrentType.Name).style.backgroundColor = '#adaaff';
                this.model.setCurrentMapType(mt.Type);
                this.model.controls[this.container.childNodes[0].id].paint(this.model, true);
            }
        },
        loadTiles: function () {
        },
        setOffset: function (offset) {
            this.Offset = offset;
        },
        drawNavControl: function () {
            if (this.Offset == null) this.Offset = { Right: 10, Top: 10 };
            this.id = Util.createUniqueID('MapType_');
            this.navToolDiv = Util.createDiv(this.id, "", "", null, null, null, 'absolute', '0px solid blue');
            this.navToolDiv.style.zIndex = 2000;
            this.navToolDiv.style.right = this.Offset.Right + 'px';
            this.navToolDiv.style.top = this.Offset.Top + 'px';
            this.navToolDiv.style.backgroundColor = '#fff';

            this.container.appendChild(this.navToolDiv);
        }
    });
})();

(function () {
    //Map navigation tools
    HTMap.NavControl = Class.create();
    HTMap.NavControl.prototype = Object.extend(new Abstract.Control(), {
        initialize: function (container, map) {
            this.container = container;
            this.drawNavControl();
            this.map = map;
            var me = this;
            map.addEventListener("ZoomChanged", function (lv) {
                me.updateSliderBar();
            });
        },
        offset: { width: 10, height: 10 },
        anchor: HTMap.ControlAnchor.ANCHOR_TOP_LEFT,

        paint: function (model) {
            this.model = model;
            /*配置滑动等级条的高度*/
            this.zoomCounts = HTMap.mapConfig.MaxZoomLevel - HTMap.mapConfig.MinZoomLevel + 1;
            this.sliderBarHeight = Util.getValueOfNoPX(Util.getCSSStyleValue(".NavControl_stdMpSliderBar", "height"));
            this.zoomInHeight = Util.getValueOfNoPX(Util.getCSSStyleValue(".NavControl_stdMpZoom_zoomIn", "height"));
            this.sliderLc = 5;//将长条稍微向上和向下各延长5px避免放大缩小按钮的图片小或者边缘透明导致断开
            this.stdMpSliderDiv.style.top = this.zoomInHeight - this.sliderLc + "px";
            this.sliderMargin = 1; //最大等级和最小等级的时候，滑块距离边缘的距离
            this.stdMpZoomOutDiv.style.top = ((this.zoomCounts) * this.sliderBarHeight + this.zoomInHeight + this.sliderMargin * 2) + "px";
            this.stdMpSliderBgTopDiv.style.height = ((this.zoomCounts) * this.sliderBarHeight + 2 * this.sliderLc + this.sliderMargin * 2) + "px";
            this.updateSliderBar();
        },

        updateSliderBar: function () {
            var zoomHeight = HTMap.mapConfig.MaxZoomLevel - this.model.getZoom().getLevel();
            var zoomSh = this.model.getZoom().getLevel() - HTMap.mapConfig.MinZoomLevel + 1;
            this.stdMpSliderBarDiv.style.top = (zoomHeight * this.sliderBarHeight + this.sliderLc + this.sliderMargin) + "px";
            this.stdMpSliderBgBotDiv.style.top = (zoomHeight * this.sliderBarHeight + this.sliderLc + 2 + this.sliderMargin) + "px";
            this.stdMpSliderBgBotDiv.style.height = (zoomSh * this.sliderBarHeight + this.sliderMargin) + "px";
        },

        loadTiles: function () {
        },

        drawNavControl: function () {
            this.id = Util.createUniqueID('Nav_');
            this.navToolDiv = document.createElement("div");
            this.navToolDiv.style.position = "absolute";
            this.navToolDiv.style.zIndex = 2000;
            this.div = this.navToolDiv;

            /*构造导航控件的各个部分div*/
            //导航上部分的平移组容器
            this.stdMpPanDiv = Util.createAbsoluteClassDiv("NavControl_stdMpPan NavControl_stdMpPan_start");
            //上下左右按钮div
            this.panButton_top = Util.createAbsoluteClassDiv("NavControl_panButton_top");
            this.panButton_right = Util.createAbsoluteClassDiv("NavControl_panButton_right");
            this.panButton_bottom = Util.createAbsoluteClassDiv("NavControl_panButton_bottom");
            this.panButton_left = Util.createAbsoluteClassDiv("NavControl_panButton_left");
            this.panButton_m = Util.createAbsoluteClassDiv("NavControl_panButton_m");
            //添加到容器
            this.stdMpPanDiv.appendChild(this.panButton_top);
            this.stdMpPanDiv.appendChild(this.panButton_right);
            this.stdMpPanDiv.appendChild(this.panButton_bottom);
            this.stdMpPanDiv.appendChild(this.panButton_left);
            this.stdMpPanDiv.appendChild(this.panButton_m);
            //注册鼠标响应事件
            var me = this;
            for (var i = 0; i < this.stdMpPanDiv.childNodes.length; i++) {
                var div = this.stdMpPanDiv.childNodes[i];
                Event.observe(div, "mouseover", function (e) {
                    var divClass = e.srcElement.className.split('_')[2];
                    me.stdMpPanDiv.className = "NavControl_stdMpPan NavControl_stdMpPan_" + divClass;
                });
                Event.observe(div, "mouseout", function (e) {
                    me.stdMpPanDiv.className = "NavControl_stdMpPan NavControl_stdMpPan_start";
                });
                Event.observe(div, "click", function (e) {
                    me.navClickHandler(e);
                })
            }
            //添加到Nav控件div
            this.navToolDiv.appendChild(this.stdMpPanDiv);

            /*下部分的滑动条*/
            //下部分的容器
            this.stdMpZoomDiv = Util.createAbsoluteClassDiv("NavControl_stdMpZoom");

            //滑动条的竖形部分的容器
            this.stdMpSliderDiv = Util.createAbsoluteClassDiv("NavControl_stdMpSlider");
            //整个竖形滑动条背景div
            this.stdMpSliderBgTopDiv = Util.createAbsoluteClassDiv("NavControl_stdMpSliderBgTop");
            //表示级别长度的竖向div
            this.stdMpSliderBgBotDiv = Util.createAbsoluteClassDiv("NavControl_stdMpSliderBgBot");
            //滑块
            this.stdMpSliderBarDiv = Util.createAbsoluteClassDiv("NavControl_stdMpSliderBar");
            Event.observe(this.stdMpSliderBarDiv, "mousedown", this.sliderDownHandler.bindAsEventListener(this));
            Event.observe(this.stdMpSliderBarDiv, "mousemove", this.sliderMoveHandler.bindAsEventListener(this));
            Event.observe(this.stdMpSliderBarDiv, "mouseup", this.sliderUpHandler.bindAsEventListener(this));
            //添加到滑动部分div
            this.stdMpSliderDiv.appendChild(this.stdMpSliderBgTopDiv);
            this.stdMpSliderDiv.appendChild(this.stdMpSliderBgBotDiv);
            this.stdMpSliderDiv.appendChild(this.stdMpSliderBarDiv);
            //添加到整个下部分的容器
            this.stdMpZoomDiv.appendChild(this.stdMpSliderDiv);

            //缩放按钮
            this.stdMpZoomInDiv = Util.createAbsoluteClassDiv("NavControl_stdMpZoom_zoomIn");
            this.stdMpZoomOutDiv = Util.createAbsoluteClassDiv("NavControl_stdMpZoom_zoomOut");
            this.stdMpZoomDiv.appendChild(this.stdMpZoomInDiv);
            this.stdMpZoomDiv.appendChild(this.stdMpZoomOutDiv);
            Event.observe(this.stdMpZoomInDiv, "click", function (e) {
                var level = me.model.getZoom().getLevel();
                me.map.setZoom(level + 1);
            });
            Event.observe(this.stdMpZoomOutDiv, "click", function (e) {
                var level = me.model.getZoom().getLevel();
                me.map.setZoom(level - 1);
            });
            //添加到Nav控件div
            this.navToolDiv.appendChild(this.stdMpZoomDiv);

            this.container.appendChild(this.navToolDiv);

            this.setOffset(this.offset);
        },

        navClickHandler: function (e) {
            var param = e.srcElement.className.split('_')[2];
            if (param != null) {
                if (param == "top") {
                    this.map.panBy(0, this.container.clientHeight / 2, { noAnimation: false });
                }
                if (param == "bottom") {
                    this.map.panBy(0, -this.container.clientHeight / 2, { noAnimation: false });
                }
                if (param == "left") {
                    this.map.panBy(this.container.clientWidth / 2, 0, { noAnimation: false });
                }
                if (param == "right") {
                    this.map.panBy(-this.container.clientWidth / 2, 0, { noAnimation: false });
                }
                if (param == "m") {
                    this.model.reset(this.container.childNodes[0]);
                }
                Event.stop(e);
            }
        },

        sliderDownHandler: function (e) {
            if (!this.isDragging)
                this.isDragging = true;
            this.elm = Event.element(e);
            this.orgTop = Util.getValueOfNoPX(this.elm.style.top);
            this.elm.style.cursor = 'pointer';
            this.orgMousePixel = Util.getMousePixel(e);

            if (this.elm.setCapture) {
                this.elm.setCapture();
            }
            else if (window.captureEvents) {
                window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP);
            }
            Event.stop(e);
        },

        sliderMoveHandler: function (e) {
            if (!this.isDragging)
                return;
            this.newMousePixel = Util.getMousePixel(e);
            var top = this.orgTop + this.newMousePixel.y - this.orgMousePixel.y;
            if (top > 0 && top < (HTMap.mapConfig.MaxZoomLevel - HTMap.mapConfig.MinZoomLevel + 1) * this.sliderBarHeight) {
                this.elm.style.top = top + "px";
                this.stdMpSliderBgBotDiv.style.top = top + 2 + "px";
                this.stdMpSliderBgBotDiv.style.height = Util.getValueOfNoPX(this.stdMpSliderBgTopDiv.style.height) - top + "px";
            }
            Event.stop(e);
        },

        sliderUpHandler: function (e) {
            if (this.isDragging)
                this.isDragging = false;
            if (this.elm.releaseCapture) {
                this.elm.releaseCapture();
            }
            else if (window.captureEvents) {
                window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP);
            }
            this.elm.style.cursor = "";
            //根据滑块的位置计算等级
            var st = Util.getValueOfNoPX(this.elm.style.top) - this.sliderLc - this.sliderMargin;
            var sliderLevel = (st / this.sliderBarHeight).toFixed(0);
            this.sliderZoom(HTMap.mapConfig.MaxZoomLevel - sliderLevel);
            Event.stop(e);
        },

        sliderZoom: function (newLevel) {
            var level = this.model.getZoom().getLevel();
            if (newLevel > HTMap.mapConfig.MaxZoomLevel) {
                newLevel = HTMap.mapConfig.MaxZoomLevel;
            }
            if (newLevel < HTMap.mapConfig.MinZoomLevel) {
                newLevel = HTMap.mapConfig.MinZoomLevel;
            }
            if (level != newLevel) {
                this.map.setZoom(newLevel);
            }
        }

    });
})();
(function () {
    //Map Overview
    HTMap.OvMap = Class.create();
    HTMap.OvMap.prototype = Object.extend(new Abstract.Control(), {
        initialize: function (map,opts) {
            this.container = document.createElement('div');
            this.container.style.position="absolute";
            this.container.style.right="0px";
            this.container.style.bottom="0px";
            map.container.appendChild(this.container);
            Util.setOptionsValue(this, opts, {
                defaultSize: { width: 200, height: 160 },
                backgroundColor:"#fff",
                zoom:HTMap.mapConfig.MinZoomLevel
            });
            this.drawOvContainer(this.container);
            var me =this;
            map.model.addEventListener("centerChange",function(e){
                if(e.sender!=me)me.paint(map.model);
            });
        },

        offset: { width: 0, height: 0 },

        anchor: HTMap.ControlAnchor.ANCHOR_BOTTOM_RIGHT,

        paint: function (model) {
            this.model = model;
            this.model.setOvContainer(this.ovMapDiv, this.id);
            this.ovModel = this.model.getOvModel(this.zoom);
            var curZoom = this.ovModel.getZoom();

            var viewBound = curZoom.getViewBoundByCenter(this.div, model.getViewCenterCoord());
            var deltaX = -viewBound.px.x;
            var deltaY = -viewBound.px.y;

            this.ovDiv.style.left = deltaX + "px";
            this.ovDiv.style.top = deltaY + "px";
            this.ovDiv.style.width = (curZoom.getTileCols() * HTMap.mapConfig.TileSize) + "px"
            this.ovDiv.style.height = (curZoom.getTileRows() * HTMap.mapConfig.TileSize) + "px"
            this.loadTiles(this.ovModel, this.ovMapDiv, this.ovDiv, false);
        },

        drawOvContainer: function (container) {
            var containerWidth = Util.getStyleWidthOrClientWidth(container);
            var containerHeight = Util.getStyleHeightOrClientHeight(container);

            var width = this.defaultSize.width;
            var height = this.defaultSize.height;

            var x = width / 2 - width / 4 / 2;
            var y = height / 2 - height / 4 / 2;

            this.id = 'Ov_';
            this.ovMapDiv = Util.createDiv(this.id, null, null, null, null, null, 'absolute', '');//?????
            this.ovMapDiv = document.createElement('div');
            this.ovMapDiv.className = "ovMapDiv";
            this.ovMapDiv.style.overflow = 'hidden';
            this.ovMapDiv.style.width = this.defaultSize.width + 'px';
            this.ovMapDiv.style.height = this.defaultSize.height + 'px';
            this.ovMapDiv.style.position = "absolute";
            this.ovMapDiv.style.backgroundColor = this.backgroundColor;

            this.ovDiv = Util.createDiv(Util.createUniqueID('Ov_Map_'));
            this.ovDiv.style.position = "absolute";
            this.ovDiv.style.zIndex = 0;
            this.ovMapDiv.appendChild(this.ovDiv);
            //this.registerEvent(this.ovDiv, 'ov_', 'mousedown,mousemove,mouseup,click');


            this.rectDiv = Util.createDiv(Util.createUniqueID('rect_'), x, y, width / 4, height / 4, null, "absolute", "");
            this.rectDiv.className = "ovMap_rectDiv";
            this.ovMapDiv.appendChild(this.rectDiv);
            this.registerEvent(this.rectDiv, 'rect_', 'mousedown,mousemove,mouseup,mouseleave');


            this.panDiv = Util.createDiv('Ov_Pan_', null, null, null, null, null, 'absolute');
            this.panDiv.className = "ovMap_panDiv ovMap_panDiv_img2";
            this.ovMapDiv.appendChild(this.panDiv);
            this.registerEvent(this.panDiv, 'pan_', 'click');

            this.div = this.ovMapDiv;
            this.container.appendChild(this.ovMapDiv);
            this.setOffset(this.offset);
            Event.observe(this.ovMapDiv,"mousedown" ,this.ovmap_mousedown.bindAsEventListener(this));
        },

        registerEvent: function (source, prefix, param) {
            var params = param.split(',');
            if (params) {
                for (var i = 0; i < params.length; i++) {
                    Event.observe(source, params[i], eval('this.' + prefix + params[i]).bindAsEventListener(this));
                }
            }
        },

        state: "open",

        pan_click: function (e) {
            if (this.state == "open") {
                //折叠鹰眼
                var me = this;
                Util.setInterval(300, 50,
                    function (args, zls) {
                        me.div.style.width = args.width + "px";
                        me.div.style.height = args.height + "px";
                    },
                    { width: Util.getStyleWidthOrClientWidth(this.div), height: Util.getStyleHeightOrClientHeight(this.div) },
                    { width: this.panDiv.clientWidth, height: this.panDiv.clientHeight }
                );
                this.state = "close";
                if (Util.hasClass(this.panDiv, "ovMap_panDiv_img2")) Util.removeClass(this.panDiv, "ovMap_panDiv_img2");
                if (!Util.hasClass(this.panDiv, "ovMap_panDiv_img1")) Util.addClass(this.panDiv, "ovMap_panDiv_img1");
            }
            else if (this.state == "close") {
                //还原鹰眼
                var me = this;
                Util.setInterval(300, 50,
                    function (args, zls) {
                        me.div.style.width = args.width + "px";
                        me.div.style.height = args.height + "px";
                    },
                    { width: Util.getStyleWidthOrClientWidth(this.div), height: Util.getStyleHeightOrClientHeight(this.div) },
                    { width: this.defaultSize.width, height: this.defaultSize.height }
                );
                this.state = "open"
                if (Util.hasClass(this.panDiv, "ovMap_panDiv_img1")) Util.removeClass(this.panDiv, "ovMap_panDiv_img1");
                if (!Util.hasClass(this.panDiv, "ovMap_panDiv_img2")) Util.addClass(this.panDiv, "ovMap_panDiv_img2");
            }
            Event.stop(e);
        },

        rect_mousedown: function (e) {
            if (!this.isDragging)
                this.isDragging = true;

            this.elm = Event.element(e);
            this.orgLeft = Util.getValueOfNoPX(this.elm.style.left);
            this.orgTop = Util.getValueOfNoPX(this.elm.style.top);
            this.orgMousePixel = Util.getMousePixel(e);
            var t_left = this.orgLeft;
            var t_top = this.orgTop;
            var t_width = this.elm.style.width;
            var t_height = this.elm.style.height;
            if (this.elm.setCapture) {
                this.elm.setCapture();
            }
            else if (window.captureEvents) {
                window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP);
            }

            this.rectTempDiv = Util.createDiv('rect_temp', t_left, t_top, t_width, t_height, null, "absolute", "2px solid green");
            this.rectTempDiv.className = "ovMap_rectDiv";
            this.rectTempDiv.style.backgroundColor = "lightyellow";
            this.elm.parentNode.insertBefore(this.rectTempDiv, this.rectDiv);

            this.ini_x = this.orgLeft;
            this.ini_y = this.orgTop;
            Event.stop(e);
        },
        rect_mousemove: function (e) {
            if (!this.isDragging || !this.orgMousePixel)
                return;
            this.newMousePixel = Util.getMousePixel(e);
            var deltaX = this.newMousePixel.x - this.orgMousePixel.x;
            var deltaY = this.newMousePixel.y - this.orgMousePixel.y;
            this.elm.style.left = (this.orgLeft + deltaX) + "px";
            this.elm.style.top = (this.orgTop + deltaY) + "px";

            Event.stop(e);
        },
        rect_mouseup: function (e) {
            if (this.elm.releaseCapture)
                this.elm.releaseCapture();
            else if (window.captureEvents)
                window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP);

            //adjust thumbnail to proper position                    
            var lastMousePixel = Util.getMousePixel(e);
            var deltaX = lastMousePixel.x - this.orgMousePixel.x;
            var deltaY = lastMousePixel.y - this.orgMousePixel.y;

            //计算大地图与小地图的应该移动的像素比例
            var scale_use = Util.getGroundResolution(this.ovModel.getZoom(), this.ovModel.getViewCenterCoord().getPoint().y) / Util.getGroundResolution(this.model.getZoom(), this.model.getViewCenterCoord().getPoint().y);
            //滑动大小地图
            this.call_glide(this.rectDiv.id, Number(deltaX), Number(deltaY), scale_use);

            this.isDragging = false;
            Event.stop(e);
        },
        rect_mouseleave:function(e){
            if(this.isDragging){
                var temprect = document.getElementById("rect_temp");
                var deltaX = Util.getValueOfNoPX(this.rectDiv.style.left)-Util.getValueOfNoPX(temprect.style.left);
                var deltaY = Util.getValueOfNoPX(this.rectDiv.style.top)-Util.getValueOfNoPX(temprect.style.top);
                var scale_use = Util.getGroundResolution(this.ovModel.getZoom(), this.ovModel.getViewCenterCoord().getPoint().y) / Util.getGroundResolution(this.model.getZoom(), this.model.getViewCenterCoord().getPoint().y);
                this.call_glide(this.rectDiv.id, Number(deltaX), Number(deltaY), scale_use);
                this.isDragging = false;
                Event.stop(e);
            }
        },
        ovmapLastDownTime:null,
        ovmapDownMinSpan:500,
        ovmap_mousedown:function(e){
            var elm = Event.element(e);
            if(elm!=this.rectDiv && elm!=this.panDiv){
                if(this.ovmapLastDownTime && e.timeStamp-this.ovmapLastDownTime<=this.ovmapDownMinSpan ){
                    return;
                }
                this.ovmapLastDownTime = e.timeStamp;
                var p = Util.getMousePixel(e);
                p.x -= Util.getLeft(this.ovMapDiv);
                p.y -= Util.getTop(this.ovMapDiv);
                var left = Util.getValueOfNoPX(this.rectDiv.style.left);
                var top = Util.getValueOfNoPX(this.rectDiv.style.top);
                var width = Util.getValueOfNoPX(this.rectDiv.style.width);
                var height = Util.getValueOfNoPX(this.rectDiv.style.height);
                var deltaX = left+width/2- p.x;
                var deltaY = top+height/2- p.y;
                this.rectTempDiv = Util.createDiv('rect_temp', left, top,width, height, null, "absolute", "2px solid green");
                this.rectTempDiv.className = "ovMap_rectDiv";
                this.rectTempDiv.style.backgroundColor = "lightyellow";
                this.ovMapDiv.insertBefore(this.rectTempDiv, this.rectDiv);
                this.rectDiv.style.left=left-deltaX+"px";
                this.rectDiv.style.top=top-deltaY+"px";
                var scale_use = Util.getGroundResolution(this.ovModel.getZoom(), this.ovModel.getViewCenterCoord().getPoint().y) / Util.getGroundResolution(this.model.getZoom(), this.model.getViewCenterCoord().getPoint().y);
                this.call_glide(this.rectDiv.id, Number(-deltaX), Number(-deltaY), scale_use);
            }
        },

        ov_mousedown: function (e) {
            return;
            if (!this.isDragging)
                this.isDragging = true;
            this.orgLeft = Util.getValueOfNoPX(this.ovDiv.style.left);
            this.orgTop = Util.getValueOfNoPX(this.ovDiv.style.top);
            this.orgMousePixel = Util.getMousePixel(e);
            if (this.ovDiv.setCapture)
                this.ovDiv.setCapture();
            else if (window.captureEvents)
                window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP);
            Event.stop(e);
        },
        ov_mousemove: function (e) {
            return;
            if (!this.isDragging || !this.orgMousePixel)
                return;
            this.newMousePixel = Util.getMousePixel(e);
            var deltaX = this.newMousePixel.x - this.orgMousePixel.x;
            var deltaY = this.newMousePixel.y - this.orgMousePixel.y;
            this.ovDiv.style.left = (this.orgLeft + deltaX) + "px";
            this.ovDiv.style.top = (this.orgTop + deltaY) + "px";
            var ini_main_map_x = Util.getValueOfNoPX(this.map.mapControl.mapDiv.style.left);


            var ini_main_map_y = Util.getValueOfNoPX(this.map.mapControl.mapDiv.style.top);
            Event.stop(e);
        },
        ov_mouseup: function (e) {
            if (this.ovDiv.releaseCapture)
                this.ovDiv.releaseCapture();
            else if (window.captureEvents)
                window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP);

            var lastMousePixel = Util.getMousePixel(e);
            var deltaX = lastMousePixel.x - this.orgMousePixel.x;
            var deltaY = lastMousePixel.y - this.orgMousePixel.y;
            this.reLoadTiles(this.model, deltaX, deltaY, true);

            this.isDragging = false;
            Event.stop(e);
        },

        ov_click: function (e) {
            this.curMousePixel = Util.getMouseRelativePixel(e, this.ovDiv);
            this.curCenterPixel = Util.getScreenPixel(this.ovModel.getViewCenterCoord(), this.ovModel.getZoom());
            var deltaX = this.curCenterPixel.x - this.curMousePixel.x;
            var deltaY = this.curCenterPixel.y - this.curMousePixel.y;
            this.ovDiv.style.left = (Util.getValueOfNoPX(this.ovDiv.style.left) + deltaX) + "px";
            this.ovDiv.style.top = (Util.getValueOfNoPX(this.ovDiv.style.top) + deltaY) + "px";
            this.reLoadTiles(this.model, deltaX, deltaY, true);

            Event.stop(e);
        },


        reLoadTiles: function (model, deltaX, deltaY, isPlus) {
            if (isPlus) {
                this.rPaintWithDivChanged();
                var c = this.ovModel.getViewCenterCoord();
                this.model.setViewCenterCoord(c,this);
                this.map.mapControl.paint(this.model, true);
            }
            else {
                this.map.mapControl.rPaintWithDivChanged(model);
                this.loadTiles(this.ovModel, this.ovMapDiv, this.ovDiv, false);
            }
        },

        rPaintWithDivChanged: function () {
            var model = this.ovModel;
            var orgCenterCoord = model.getViewCenterCoord();
            var curZoom = model.getZoom();
            //当前中心点
            var px = {
                x: Util.getStyleWidthOrClientWidth(this.div) / 2 - Util.getValueOfNoPX(this.ovDiv.style.left),
                y: Util.getStyleHeightOrClientHeight(this.div) / 2 - Util.getValueOfNoPX(this.ovDiv.style.top)
            };
            var newCenterCoord = Util.getCoordinateByPixel(px, curZoom);
            if (!newCenterCoord.isSame(orgCenterCoord))
                model.setViewCenterCoord(newCenterCoord);
            this.loadTiles(model, this.ovMapDiv, this.ovDiv, false);
        },

        /**
         *
         * @param layerId rectDivID
         * @param dest_x_t rect偏移量x
         * @param dest_y_t rect偏移量y
         * @param scale_t ？？
         */
        call_glide: function (layerId, dest_x_t, dest_y_t, scale_t) {
            this.reset();
            this.target = Prototype.$(layerId);
            this.ini_x = Number(Util.getValueOfNoPX(this.target.style.left));//rect的left
            this.ini_y = Number(Util.getValueOfNoPX(this.target.style.top));//rect的top
            this.ini_x_map = Number(Util.getValueOfNoPX(this.target.parentNode.childNodes[0].style.left)); //ov小地图的mapdiv的left
            this.ini_y_map = Number(Util.getValueOfNoPX(this.target.parentNode.childNodes[0].style.top)); //ov小地图的mapdiv的top
            this.ini_x_main_map = Number(Util.getValueOfNoPX(this.map.mapControl.mapDiv.style.left)); //mapdiv的left
            this.ini_y_main_map = Number(Util.getValueOfNoPX(this.map.mapControl.mapDiv.style.top)); //mapdiv的top

            this.glide((-dest_x_t), (-dest_y_t), scale_t);

        },

        /**
         * 执行移动大小地图的动画
         * @param dest_x 偏移量x
         * @param dest_y 偏移量y
         * @param scale_test 大小地图移动的像素比例
         */
        glide: function (dest_x, dest_y, scale_test) {
            //确认目标（rect矩形）
            if (this.target) {
                var coefficient = 12;
                var dist_x, dist_y;
                //y轴上已经移动的距离
                if (dest_y != 0 && this.y_moved != dest_y) {
                    //需要移动的距离
                    dist_y = (Math.max(Math.abs(this.y_moved), Math.abs(dest_y)) - Math.min(Math.abs(this.y_moved), Math.abs(dest_y)));

                    if (dist_y < Math.abs(dest_y / coefficient)) {
                        //不足一次移动，下一次停止
                        this.y_moved = dest_y;
                        this.control_mark = 1;
                    }
                    else {
                        //移动一次
                        this.y_moved = this.y_moved + dest_y / coefficient;
                        //移动矩形
                        this.target.style.top = (this.ini_y + this.y_moved) + "px";
                        //移动小地图
                        this.target.parentNode.childNodes[0].style.top = (this.ini_y_map + this.y_moved) + "px";
                        //移动大地图
                        this.map.mapControl.mapDiv.style.top = (this.ini_y_main_map + this.y_moved * scale_test) + "px";
                        //标记下一次移动
                        this.control_mark = 2;
                    }

                }
                if (dest_x != 0 && this.x_moved != dest_x) {

                    dist_x = (Math.max(Math.abs(this.x_moved), Math.abs(dest_x)) - Math.min(Math.abs(this.x_moved), Math.abs(dest_x)));

                    if (this.control_mark == 1 || dist_x < Math.abs(dest_x / coefficient)) {
                        this.x_moved = dest_x;
                        this.control_mark = 1;
                    }
                    else {
                        this.x_moved = this.x_moved + dest_x / coefficient;
                        this.target.style.left = (this.ini_x + this.x_moved) + "px";
                        this.target.parentNode.childNodes[0].style.left = (this.ini_x_map + this.x_moved) + "px";
                        this.map.mapControl.mapDiv.style.left = (this.ini_x_main_map + this.x_moved * scale_test) + "px";
                        this.control_mark = 2;
                    }

                }

                //timer control
                if (this.control_mark == 2) {
                    this.glide_timer = setTimeout(function () { this.glide(dest_x, dest_y, scale_test) }.bind(this), 1);
                }
                else if (this.control_mark == 1) {
                    //最后一次移动
                    this.target.style.left = (this.ini_x + dest_x) + "px";
                    this.target.style.top = (this.ini_y + dest_y) + "px";
                    this.target.parentNode.childNodes[0].style.left = (this.ini_x_map + this.x_moved) + "px";
                    this.target.parentNode.childNodes[0].style.top = (this.ini_y_map + this.y_moved) + "px";
                    this.map.mapControl.mapDiv.style.left = (this.ini_x_main_map + this.x_moved * scale_test) + "px";
                    this.map.mapControl.mapDiv.style.top = (this.ini_y_main_map + this.y_moved * scale_test) + "px";
                    this.target.parentNode.removeChild(document.getElementById("rect_temp"));
                    //停止动画
                    clearTimeout(this.glide_timer);
                    this.reset();
                }
                else {
                    if (document.getElementById("rect_temp"))
                        this.target.parentNode.removeChild(document.getElementById("rect_temp"));
                }
                if (this.control_mark < 2) {
                    //抵达最后一次移动之后，刷新大小地图
                    setTimeout(function () { this.reLoadTiles(this.model, -dest_x, -dest_y, false) }.bind(this), 1);
                }
                this.control_mark = 0;
                dist_x = 0;
                dist_y = 0;
            }
        },

        reset: function () {
            this.x_moved = 0;
            this.y_moved = 0;
            this.ini_x = 0;
            this.ini_y = 0;
            this.ini_x_map = 0;
            this.ini_y_map = 0;
            this.ini_x_main_map = 0;
            this.ini_y_main_map = 0;
            this.target = null;
            this.control_mark = 0;
            this.glide_timer = null;
        }
    });
})();

(function () {
    //PoweredBy Control
    HTMap.PoweredByControl = Class.create();
    HTMap.PoweredByControl.prototype = {
        initialize: function (container, opts) {
            this.opts = opts || {
                    LinkUrl: "",
                    Img: "",
                    Size: { width: 0, height: 0 },
                    Alt: "版权所有"
                };
            Util.setOptionsValue(this.opts, opts, this.opts);
            this.id = 'PoweredBy_';
            this.poweredbyDiv = this.create(container)
            container.appendChild(this.poweredbyDiv);
        },

        create: function (container) {
            var left = Util.getValueOfNoPX(container.style.left);
            var top = Util.getStyleHeightOrClientHeight(container) - this.opts.Size.height;
            var div = Util.createDiv(this.id, left, top, this.opts.Size.width, this.opts.Size.height, null, 'absolute')
            div.innerHTML = '<a href=' + this.opts.LinkUrl +
                ' target="_blank"><img src=' + this.opts.Img +
                ' width="' + this.opts.Size.width +
                '" height="' + this.opts.Size.height +
                '" alt=' + this.opts.Alt +
                ' border="0" /></a>';
            return div;
        }
    };
})();
(function () {
    //Scale Control
    HTMap.ScaleControl = Class.create();
    HTMap.ScaleControl.prototype = Object.extend(new Abstract.Control(), {
        initialize: function (container, map) {
            this.map = map;
            this.id = 'Scale_';
            this.scaleDiv = this.create(container);
            container.appendChild(this.scaleDiv);
            var me = this;
            this.map.mapControl.addEventListener("loadTiles", function () { me.updateScale(); });
            this.map.addEventListener("centerChange", function () { me.updateScale(); });
            this.updateScale();
        },
        offset: { width: 20, height: 30 },
        anchor: HTMap.ControlAnchor.ANCHOR_BOTTOM_LEFT,
        updateScale: function () {
            if (!this.created) return;
            var z = this.map.model.getZoom();
            if (!z) return;
            var scale = z.getScale(this.map.getCenter().y);//每个像素代表的距离(米)
            //取一个值使得比例尺最接近整数,计算该值对应的像素距离(变长比例尺)
            var smstring = "";
            var cm2 = 0;
            var pxw = 90;//最接近90像素的显示
            var pxcms = [
                1000000 / scale,
                100000 / scale,
                10000 / scale,
                1000 / scale,
                100 / scale
            ];
            var minw = Number.MAX_VALUE;
            for (var i = 0; i < pxcms.length; i++) {
                if (Math.abs(pxcms[i] - pxw) < minw) //找到最接近90像素的那个距离
                {
                    cm2 = pxcms[i];
                    switch (i) {
                        case 0:
                            smstring = "1000公里";
                            break;
                        case 1:
                            smstring = "100公里";
                            break;
                        case 2:
                            smstring = "10公里";
                            break;
                        case 3:
                            smstring = "1000米";
                            break;
                        case 4:
                            smstring = "100米";
                            break;
                    }
                    minw = Math.abs(pxcms[i] - pxw);
                }
            }
            //计算比例尺的合适值,防止出现过短的比例尺
            if (cm2 < pxw) {
                var b = Math.floor(pxw / cm2);//1~9倍
                if (b <= 9) {
                    cm2 *= b;
                    smstring = b + smstring.substring(1);//改写第一位数字
                }
            }

            this.scaleDiv.style.width = cm2 + 'px';
            this.scaleInfoDiv.innerText = smstring;
        },
        create: function (container) {
            var div_left = document.createElement('div');
            div_left.className = "ScaleControl_I_Left";
            var div_bottom = document.createElement('div');
            div_bottom.className = "ScaleControl_I_Bottom";
            var div_right = document.createElement('div');
            div_right.className = "ScaleControl_I_Right";

            var div = Util.createDiv(this.id, null, null, null, null, null, 'absolute')
            var scaleInfo = document.createElement('div');
            scaleInfo.className = "ScaleControl_ScaleInfo";

            div.appendChild(div_bottom);
            div.appendChild(div_left);
            div.appendChild(div_right);
            div.appendChild(scaleInfo);
            this.scaleInfoDiv = scaleInfo;

            this.created = true;

            this.div = div;
            this.setOffset(this.offset);

            return div;
        }
    });

})();

(function () {
    HTMap.Area = Class.create();
    HTMap.Area.prototype = Object.extend(new Abstract.OverLayer(), {

        initialize: function (cps, opts) {
            this.points = cps;
            /*注意cps里面的每个元素的结构如下{p,inp,out}*/
            Util.setOptionsValue(this, opts, {
                strokeColor: "#FF0000",
                fillColor: "#FF0000",
                fillOpacity: 0.5,
                strokeWeight: 1,
                strokeOpacity: 0.5,
                strokeStyle: 'solid',
                enableMassClear: true,
                enableEditing: false,
                enableClicking: false
            });
            Util.setClassEvent(this);
        },

        buildExtent: function () {
            var minX = 180e16, maxX = 0, minY = 90e16, maxY = 0;

            for (var i = 0; i < this.points.length; i++) {
                if (this.points[i].p.getCoord().x < minX) minX = this.points[i].p.getCoord().x;
                if (this.points[i].p.getCoord().x > maxX) maxX = this.points[i].p.getCoord().x;
                if (this.points[i].p.getCoord().y < minY) minY = this.points[i].p.getCoord().y;
                if (this.points[i].p.getCoord().y > maxY) maxY = this.points[i].p.getCoord().y;
            }
            return new HTMap.Bound(minX, maxX, minY, maxY);
        },

        getExtent: function () {
            return this.bound;
        },

        setExtent: function (extent) {
            this.bound = extent;
        },

        getCenterCoord: function () {
            return this.getExtent().getCenterCoord();
        },

        initEvent: function () {
            Event.observe(this.div, "click", (function (e) {
                if (this.enableClicking) this.triggerEvent("click", { sender: this, e: e });
            }).bindAsEventListener(this));
            Event.observe(this.div, "dblclick", (function (e) {
                if (this.enableClicking) this.triggerEvent("dblclick", { sender: this, e: e });
            }).bindAsEventListener(this));
            Event.observe(this.div, "mousedown", (function (e) {
                this.triggerEvent("mousedown", { sender: this, e: e });
            }).bindAsEventListener(this));
            Event.observe(this.div, "mouseup", (function (e) {
                this.triggerEvent("mouseup", { sender: this, e: e });
            }).bindAsEventListener(this));
            Event.observe(this.div, "mouseout", (function (e) {
                this.triggerEvent("mouseout", { sender: this, e: e });
            }).bindAsEventListener(this));
            Event.observe(this.div, "mouseover", (function (e) {
                this.triggerEvent("mouseover", { sender: this, e: e });
            }).bindAsEventListener(this));
        },

        setToMap: function (map) {
            if (!this.div) {
                this.id = Util.createUniqueID('Over_Polygon_');
                this.div = Util.createDiv(this.id, 0, 0, null, null, null, 'absolute');
                this.div.style.zIndex = 10;
                this.mapDiv.appendChild(this.div);
                this.initEvent();
            }
            this.UpdateLocation();
            this.UpdateDraw();
        },
        //更新内部图形
        UpdateDraw: function () {
            if (!this.div) return;
            var curZoom = this.model.getZoom();
            var nps = [];
            for (var i = 0; i < this.points.length; i++) {
                var c = this.points[i];
                nps.push({
                    p: Util.getScreenPixel(new HTMap.Coordinate(c.p.getCoord().x, c.p.getCoord().y), curZoom),
                    inp: Util.getScreenPixel(new HTMap.Coordinate(c.inp.getCoord().x, c.inp.getCoord().y), curZoom),
                    out: Util.getScreenPixel(new HTMap.Coordinate(c.out.getCoord().x, c.out.getCoord().y), curZoom)
                });
            }
            var bound = { w: this.mapDiv.scrollWidth, h: this.mapDiv.scrollHeight };
            var linesStr = DrawUtil.drawArea(nps, bound, this);
            this.div.innerHTML = linesStr;
        },
        //更新位置
        UpdateLocation: function () {
            this.bound = this.buildExtent();
        },

        /**
         * 设置多边型的点数组
         * @param points
         */
        setPath: function (points) {
            this.points = points;
            this.UpdateLocation();
            this.UpdateDraw();
        },
        /**
         * 返回多边型的点数组
         * @return {*}
         */
        getPath: function () {
            return this.points;
        },
        /**
         * 设置多边型的边线颜色，参数为合法的CSS颜色值。
         * @param color
         */
        setStrokeColor: function (color) {
            this.strokeColor = color;
            this.UpdateDraw();
        },
        /**
         * 返回多边型的边线颜色。
         * @return {*}
         */
        getStrokeColor: function () {
            return this.strokeColor;
        },
        /**
         * 设置多边形的填充颜色，参数为合法的CSS颜色值。
         * @param color
         */
        setFillColor: function (color) {
            this.fillColor = color;
            this.UpdateDraw();
        },
        /**
         * 返回多边形的填充颜色。
         * @return {*}
         */
        getFillcolor: function () {
            return this.fillColor;
        },
        /**
         * 设置多边形的边线透明度，取值范围0 - 1。
         * @param opacity
         */
        setStrokeOpacity: function (opacity) {
            this.strokeOpacity = opacity;
            this.UpdateDraw();
        },
        /**
         * 返回多边形的边线透明度。
         * @return {*}
         */
        getStrokeOpacity: function () {
            return this.strokeOpacity;
        },
        /**
         * 设置多边形的填充透明度，取值范围0 - 1。
         * @param opacity
         */
        setFillOpacity: function (opacity) {
            this.fillOpacity = opacity;
            this.UpdateDraw();
        },
        /**
         * 返回多边形的填充透明度。
         * @return {*}
         */
        getFillOpacity: function () {
            return this.fillOpacity;
        },
        /**
         * 设置多边形边线的宽度，取值为大于等于1的整数。
         * @param weight
         */
        setStrokeWeight: function (weight) {
            this.strokeWeight = weight;
            this.UpdateDraw();
        },
        /**
         * 返回多边形边线的宽度。
         * @return {*}
         */
        getStrokeWeight: function () {
            return this.strokeWeight;
        },
        /**
         * 设置多边形边线样式为实线或虚线，取值solid或dashed。
         * @param style
         */
        setStrokeStyle: function (style) {
            this.strokeStyle = style;
            this.UpdateDraw();
        },
        /**
         * 返回多边形边线样式。
         * @return {*}
         */
        getStrokeStyle: function () {
            return this.strokeStyle;
        },
        /**
         * 返回覆盖物的地理区域范围。
         * @return {*}
         */
        getBounds: function () {
            return this.bound;
        },
        /**
         * 开启/关闭 编辑功能
         * @param enableEditing
         */
        setEnableEditing: function (enableEditing) {
            if (this.enableEditing != enableEditing) {
                if (enableEditing) {
                    //开启编辑

                }
                else {
                    //关闭编辑

                }
            }
        },
        /**
         * 修改指定位置的坐标。索引index从0开始计数。
         * @param index
         * @param point
         */
        setPositionAt: function (index, point) {
            this.points[index] = point;
            this.UpdateLocation();
            this.UpdateDraw();
        }
    });

})();
(function () {
    HTMap.Arrows = Class.create();
    HTMap.Arrows.prototype = Object.extend(new Abstract.OverLayer(), {

        initialize: function (startPoint, startPoint2, endPoint, ctrlPoint, opts) {
            this.points = [startPoint, startPoint2, endPoint, ctrlPoint];
            Util.setOptionsValue(this, opts, {
                strokeColor: "#FF0000",
                fillColor: "#FF0000",
                fillOpacity: 0,
                strokeWeight: 0,
                strokeOpacity: 0,
                strokeStyle: 'solid',
                enableMassClear: true,
                enableEditing: false,
                enableClicking: false,
                arrowsAngle: 25,/*箭头的角度*/
                cornerAngle: 330,/*箭头的内凹角度*/
                arrowsLength: 50,/*箭头的开头2个边的长度*/
                cornerLength: 20 /*箭头内凹边长度*/
            });
            Util.setClassEvent(this);
        },

        buildExtent: function () {
            var minX = 180e16, maxX = 0, minY = 90e16, maxY = 0;

            for (var i = 0; i < this.points.length; i++) {
                if (this.points[i].getCoord().x < minX) minX = this.points[i].getCoord().x;
                if (this.points[i].getCoord().x > maxX) maxX = this.points[i].getCoord().x;
                if (this.points[i].getCoord().y < minY) minY = this.points[i].getCoord().y;
                if (this.points[i].getCoord().y > maxY) maxY = this.points[i].getCoord().y;
            }
            return new HTMap.Bound(minX, maxX, minY, maxY);
        },

        getExtent: function () {
            return this.bound;
        },

        setExtent: function (extent) {
            this.bound = extent;
        },

        getCenterCoord: function () {
            return this.getExtent().getCenterCoord();
        },

        initEvent: function () {
            Event.observe(this.div, "click", (function (e) {
                if (this.enableClicking) this.triggerEvent("click", { sender: this, e: e });
            }).bindAsEventListener(this));
            Event.observe(this.div, "dblclick", (function (e) {
                if (this.enableClicking) this.triggerEvent("dblclick", { sender: this, e: e });
            }).bindAsEventListener(this));
            Event.observe(this.div, "mousedown", (function (e) {
                this.triggerEvent("mousedown", { sender: this, e: e });
            }).bindAsEventListener(this));
            Event.observe(this.div, "mouseup", (function (e) {
                this.triggerEvent("mouseup", { sender: this, e: e });
            }).bindAsEventListener(this));
            Event.observe(this.div, "mouseout", (function (e) {
                this.triggerEvent("mouseout", { sender: this, e: e });
            }).bindAsEventListener(this));
            Event.observe(this.div, "mouseover", (function (e) {
                this.triggerEvent("mouseover", { sender: this, e: e });
            }).bindAsEventListener(this));
        },

        MakerPath: function (sp1, sp2, cp, ep) {
            //从结束点开始算起，计算箭头形状的几个点坐标
            var a = this.arrowsAngle, b = this.cornerAngle;
            var d = this.arrowsLength, md = this.cornerLength;
            //锐角点
            var p1 = DrawBaseUtil.aLPoint(ep, cp, d, -a);
            var p2 = DrawBaseUtil.aLPoint(ep, cp, d, a);
            //曲线结束点
            var qp1 = DrawBaseUtil.aLPoint(p1, ep, md, b);
            var qp2 = DrawBaseUtil.aLPoint(p2, ep, md, -b);
            var path = "M{起点1}C{控制点},{控制点},{曲线结束点1}L{锐角点1},{终点},{锐角点2},{曲线结束点2}C{控制点},{控制点},{起点2}".format({
                "起点1": DrawBaseUtil.pToStr(sp1),
                "控制点": DrawBaseUtil.pToStr(cp),
                "曲线结束点1": DrawBaseUtil.pToStr(qp1),
                "锐角点1": DrawBaseUtil.pToStr(p1),
                "终点": DrawBaseUtil.pToStr(ep),
                "锐角点2": DrawBaseUtil.pToStr(p2),
                "曲线结束点2": DrawBaseUtil.pToStr(qp2),
                "起点2": DrawBaseUtil.pToStr(sp2)
            });
            return path;
        },

        setToMap: function (map) {
            if (!this.div) {
                this.id = Util.createUniqueID('Over_Polygon_');
                var curZoom = this.model.getZoom();
                var pxPoints = [];
                for (var i = 0; i < this.points.length; i++) {
                    var ePoint = Util.getScreenPixel(new HTMap.Coordinate(this.points[i].getCoord().x, this.points[i].getCoord().y), curZoom);
                    pxPoints.push(ePoint.x + "," + ePoint.y);
                }
                var path = this.MakerPath(pxPoints[0], pxPoints[1], pxPoints[3], pxPoints[2]);
                this.div = this.drawPaper.path(path).attr({
                    "stroke": this.strokeColor,
                    "fill": this.fillColor,
                    "fill-opacity": this.fillOpacity,
                    "stroke-width": this.strokeWeight,
                    "stroke-opacity": this.strokeOpacity,
                    "stroke-dasharray": this.strokeStyle
                });
                this.initEvent();
            }
            this.UpdateLocation();
            this.UpdateDraw();
        },
        //更新内部图形
        UpdateDraw: function () {
            if (!this.div) return;
            var curZoom = this.model.getZoom();
            var pxPoints = [];
            for (var i = 0; i < this.points.length; i++) {
                var ePoint = Util.getScreenPixel(new HTMap.Coordinate(this.points[i].getCoord().x, this.points[i].getCoord().y), curZoom);
                pxPoints.push({ x: ePoint.x, y: ePoint.y });
            }
            var s = this.MakerPath(pxPoints[0], pxPoints[1], pxPoints[3], pxPoints[2]);
            //计算渐变角度
            var a = Math.floor(DrawBaseUtil.getAngle(pxPoints[0], pxPoints[1]) + 90);
            this.div.attr({
                "path": s,
                "stroke": this.strokeColor,
                "fill": "{0}-{1}-{1}".format(a, this.fillColor),
                "fill-opacity": this.fillOpacity,
                "stroke-width": this.strokeWeight,
                "stroke-opacity": this.strokeOpacity,
                "stroke-dasharray": this.strokeStyle
            });
        },
        //更新位置
        UpdateLocation: function () {
            //        this.bound = this.buildExtent();
        },

        /**
         * 设置多边型的点数组
         * @param points
         */
        setPath: function (points) {
            this.points = points;
            this.UpdateLocation();
            this.UpdateDraw();
        },
        /**
         * 返回多边型的点数组
         * @return {*}
         */
        getPath: function () {
            return this.points;
        },
        /**
         * 设置多边型的边线颜色，参数为合法的CSS颜色值。
         * @param color
         */
        setStrokeColor: function (color) {
            this.strokeColor = color;
            this.UpdateDraw();
        },
        /**
         * 返回多边型的边线颜色。
         * @return {*}
         */
        getStrokeColor: function () {
            return this.strokeColor;
        },
        /**
         * 设置多边形的填充颜色，参数为合法的CSS颜色值。
         * @param color
         */
        setFillColor: function (color) {
            this.fillColor = color;
            this.UpdateDraw();
        },
        /**
         * 返回多边形的填充颜色。
         * @return {*}
         */
        getFillcolor: function () {
            return this.fillColor;
        },
        /**
         * 设置多边形的边线透明度，取值范围0 - 1。
         * @param opacity
         */
        setStrokeOpacity: function (opacity) {
            this.strokeOpacity = opacity;
            this.UpdateDraw();
        },
        /**
         * 返回多边形的边线透明度。
         * @return {*}
         */
        getStrokeOpacity: function () {
            return this.strokeOpacity;
        },
        /**
         * 设置多边形的填充透明度，取值范围0 - 1。
         * @param opacity
         */
        setFillOpacity: function (opacity) {
            this.fillOpacity = opacity;
            this.UpdateDraw();
        },
        /**
         * 返回多边形的填充透明度。
         * @return {*}
         */
        getFillOpacity: function () {
            return this.fillOpacity;
        },
        /**
         * 设置多边形边线的宽度，取值为大于等于1的整数。
         * @param weight
         */
        setStrokeWeight: function (weight) {
            this.strokeWeight = weight;
            this.UpdateDraw();
        },
        /**
         * 返回多边形边线的宽度。
         * @return {*}
         */
        getStrokeWeight: function () {
            return this.strokeWeight;
        },
        /**
         * 设置多边形边线样式为实线或虚线，取值solid或dashed。
         * @param style
         */
        setStrokeStyle: function (style) {
            this.strokeStyle = style;
            this.UpdateDraw();
        },
        /**
         * 返回多边形边线样式。
         * @return {*}
         */
        getStrokeStyle: function () {
            return this.strokeStyle;
        },
        /**
         * 返回覆盖物的地理区域范围。
         * @return {*}
         */
        getBounds: function () {
            return this.bound;
        },
        /**
         * 开启/关闭 编辑功能
         * @param enableEditing
         */
        setEnableEditing: function (enableEditing) {
            if (this.enableEditing != enableEditing) {
                if (enableEditing) {
                    //开启编辑

                }
                else {
                    //关闭编辑

                }
            }
        },
        /**
         * 修改指定位置的坐标。索引index从0开始计数。
         * @param index
         * @param point
         */
        setPositionAt: function (index, point) {
            this.points[index] = point;
            this.UpdateLocation();
            this.UpdateDraw();
        }
    });
})();
(function () {
    HTMap.Bound = Class.create();
    HTMap.Bound.prototype = {
        initialize: function (minX, maxX, minY, maxY) {
            if(arguments.length==2){
                this.minX = minX.x*1e16;
                this.minY = minX.y*1e16;
                this.maxX = maxX.x*1e16;
                this.maxY = maxX.y*1e16;
            }
            else{
                this.minX = minX;
                this.maxX = maxX;
                this.minY = minY;
                this.maxY = maxY;
            }
            this.centerCoord = new HTMap.Coordinate((this.minX + this.maxX) / 2, (this.minY + this.maxY) / 2);
        },

        getCenterCoord: function () {
            return this.centerCoord;
        },

        clone: function (coord) {
            if (coord == null || coord.isSame(this.centerCoord)) {
                return this;
            }
            else {
                var minX = this.minX + coord.x - this.centerCoord.x;
                var maxX = this.maxX + coord.x - this.centerCoord.x;
                var minY = this.minY + coord.y - this.centerCoord.y;
                var maxY = this.maxY + coord.y - this.centerCoord.y;
                return new HTMap.Bound(minX, maxX, minY, maxY);
            }
        },

        isCover: function (bound) {
            if (this.getMinX() > bound.getMaxX() || this.getMaxX() < bound.getMinX() || this.getMinY() > bound.getMaxY() || this.getMaxY() < bound.getMinY()) {
                return false;
            }
            return true;
        },

        isWithin: function (coord) {
            if (coord.x <= this.maxX && coord.x >= this.minX && coord.y <= this.maxY && coord.y >= this.minY) {
                return true;
            }
            return false;
        },

        getMinX: function () {
            return this.minX;
        },

        getMaxX: function () {
            return this.maxX;;
        },

        getMinY: function () {
            return this.minY;
        },

        getMaxY: function () {
            return this.maxY;
        },

        getHeight: function () {
            return Math.abs(this.maxY - this.minY);
        },

        getWidth: function () {
            return Math.abs(this.maxX - this.minX);
        },

        getPixelHeight: function (zoom) {
            var topleft = Util.getScreenPixel(new HTMap.Coordinate(this.minX, this.maxY), zoom).y;
            var bottomright = Util.getScreenPixel(new HTMap.Coordinate(this.maxX, this.minY), zoom).y;
            return Math.floor(Math.abs(topleft - bottomright));

        },
        //像素宽度
        getPixelWidth: function (zoom) {
            var topleft = Util.getScreenPixel(new HTMap.Coordinate(this.minX, this.maxY), zoom).x;
            var bottomright = Util.getScreenPixel(new HTMap.Coordinate(this.maxX, this.minY), zoom).x;
            return Math.floor(Math.abs(bottomright - topleft));
        },


        //如果点的地理坐标位于此矩形内，则返回true。
        containsPoint: function(point){
            return this.isWithin(point.getCoord());
        },
        //传入的矩形区域完全包含于此矩形区域中，则返回true。
        containsBounds:function(bound){
            return bound.getMinX()>=this.getMinX() && bound.getMaxX()<=this.getMaxX() && bound.getMinY()>= this.getMinY() && bound.getMaxY()<=this.getMaxY();
        },
        //返回矩形区域的西南角。
        getSouthWest:function(){
            return new HTMap.CPoint(this.minX/1e16,this.minY/1e16);
        },
        //返回矩形区域的东北角。
        getNorthEast:function(){
            return new HTMap.CPoint(this.maxX/1e16,this.maxY/1e16);
        },
        //返回矩形的中心点。
        getCenter:function(){
            return this.centerCoord.getPoint();
        },
        //计算交集矩形
        intersects:function(other){
            var minx=Math.max(this.minX,other.minX),maxx=Math.min(this.maxX,other.maxX),
                miny=Math.max(this.minY,other.minY),maxy=Math.min(this.maxY,other.maxY);
            if(minx<=maxx && miny<=maxy)return new HTMap.Bound(minx,maxx,miny,maxy);
        }
    }
})();
(function () {

    HTMap.Circle = Class.create();
    HTMap.Circle.prototype = Object.extend(new Abstract.GraphOverLayer(), {

        initialize: function (center, radius, opts) {
            if(arguments.length==1){
                opts = null;
                this.points = center;
                this.center=this.buildExtent().getCenter();
                this.radius=Util.distanceByLnglat(this.points[0].x,this.center.y,this.points[1].x,this.center.y)/2;
            }
            else{
                //var d = Util.lngByDistance(center.y, radius);
                /*注意此处的圆形坐标数组的结构为:[(minx,maxy),(maxx,miny)]*/
                var ks = Util.distanceOfLngLat(center.x, center.y);
                var dx = radius*ks.lng;
                var dy = radius*ks.lat;
                this.points = [new HTMap.CPoint(center.x-dx, center.y+dy),new HTMap.CPoint(center.x+dx, center.y-dy)];
                this.center = new HTMap.CPoint(center.x, center.y);
                this.center = center;
                this.radius = radius;
            }
            Util.setOptionsValue(this, opts, {
                strokeColor: "#FF0000",
                fillColor: "#FF0000",
                fillOpacity: 0.5,
                strokeWeight: 1,
                strokeOpacity: 0.5,
                strokeStyle: 'solid',
                enableMassClear: true,
                enableEditing: false,
                enableClicking: false
            });
        },
        getCenter:function(){return this.center;},
        setCenter:function(point){
            var dx = point.x-this.center.x;
            var dy = point.y-this.center.y;
            if(dx!=0 || dy !=0){
                this.points[0].x+=dx;
                this.points[0].y+=dy;
                this.points[1].x+=dx;
                this.points[1].y+=dy;
                this.center.x=point.x;
                this.center.y=point.y;
                this.UpdateGeometry();
            }
        },
        getRadius:function(){return this.radius;},
        setRadius:function(radius){
            var ks = Util.distanceOfLngLat(this.center.x, this.center.y);
            var dx = radius*ks.lng;
            var dy = radius*ks.lat;
            this.points = [new HTMap.CPoint(this.center.x-dx, this.center.y+dy),new HTMap.CPoint(this.center.x+dx, this.center.y-dy)];
            this.radius = radius;
            this.UpdateGeometry();
        },
        CreateDiv:function(){
            if (!this.div) {
                this.id = Util.createUniqueID('Over_Polygon_');
                this.div = this.drawPaper.ellipse(0, 0, 0, 0);
            }
        },
        UpdateGeometry: function () {
            if (!this.div) return;
            var curZoom = this.model.getZoom();
            var pxPoints = [];
            for (var i = 0; i < this.points.length; i++) {
                var ePoint = Util.getScreenPixel(new HTMap.Coordinate(this.points[i].getCoord().x, this.points[i].getCoord().y), curZoom);
                pxPoints.push({ x: ePoint.x, y: ePoint.y });
            }
            var dx = (pxPoints[0].x - pxPoints[1].x) / 2;
            var dy = (pxPoints[0].y - pxPoints[1].y) / 2;
            var cx, cy, rx, ry;
            if (dx < 0) {
                cx = pxPoints[1].x + dx;
                rx = -dx;
            }
            else {
                cx = pxPoints[1].x + dx;
                rx = dx;
            }
            if (dy < 0) {
                cy = pxPoints[1].y + dy;
                ry = -dy;
            }
            else {
                cy = pxPoints[1].y + dy;
                ry = dy;
            }
            this.div.attr({
                cx: cx,
                rx: rx,
                cy: cy,
                ry: ry
            });
        }
    });
})();
(function () {
    HTMap.Coordinate = Class.create();
    HTMap.Coordinate.prototype = {
        initialize: function (x, y) {
            this.x = x;
            this.y = y;
        },

        isSame: function (coord) {
            if (coord && this.x == coord.x && this.y == coord.y)
                return true;
            return false;
        },

        getBound: function (width, height) {
            return new HTMap.Bound(this.x - width / 2, this.x + width / 2, this.y - height / 2, this.y + height / 2);
        },

        getPoint: function () {
            return new HTMap.CPoint(this.x / 1e16, this.y / 1e16);
        },

        toString: function () {
            return 'X:' + this.x + ',Y:' + this.y;
        }
    }
})();
(function () {

    /**
     * 此类用来管理密集点图层 (待整理的类型，暂不可使用)
     * @type {*}
     */
    HTMap.DMMarkerManger = Class.create();
    HTMap.DMMarkerManger.prototype = {
        initialize: function (map, opts) {
            this.map = map;
            Util.setOptionsValue(this, opts, {
                TileSize: 256,
                defaultIcon: '/MinMarker.png',
                projection: "rectangularProjection"
            });
            Util.setClassEvent(this);
        },
        loadMarkers: function (url, imgurl, updateurl, opts, loadcallback) {
            var me = this;
            var map = this.map;
            loadcallback = loadcallback || function (hotData) { };
            opts = opts || {};
            Util.setOptionsValue(opts, opts, {
                parameters: {},
                icon: me.defaultIcon,
                hotspotOffsets: [5, 10, 5, 5]
            });
            var cZoom = map.model.getZoom();
            var parameters = {
                realMapBound_MinX: cZoom.realMapBound.getMinX(),
                realMapBound_MaxY: cZoom.realMapBound.getMaxY(),
                realMapBound_Width: cZoom.realMapBound.getWidth(),
                realMapBound_Height: cZoom.realMapBound.getHeight(),
                TileSize: this.TileSize,
                tileCols: cZoom.getTileCols(),
                tileRows: cZoom.getTileRows(),
                level: cZoom.getLevel(),
                projection: me.projection,
                rnd: Math.random()
            };
            Util.setOptionsValue(parameters, opts.parameters, {});
            new Ajax.Request(url, {
                parameters: parameters,
                onComplete: function (data) {
                    var d = eval('(' + data.responseText + ')');
                    var pHm = new PartitionHotspotManager(map, { offsets: opts.hotspotOffsets });
                    pHm.hotspots = me.convertSeverHotData(d);
                    var cmt = map.model.getCurrentMapType();
                    var tf;
                    cmt.SrcFuncs.push(tf = function (level, row, column) {
                        return imgurl + "?level=" + level + "&row=" + row + "&column=" + column + "&imgID=" + d.ImgID + "&icon=" + opts.icon;
                    });
                    map.mapControl.rPaint(map.model);
                    loadcallback(new DMLayer(d.ImgID, updateurl, pHm, tf, cmt));
                }
            });
        },

        convertSeverHotData: function (d) {
            var cZoom = this.map.model.getZoom();
            var data = d.Hotspots;
            var hd = {};
            for (var i = 0; i < data.length; i++) {
                var a = data[i];
                hd[a.Key] = {};
                for (var j = 0; j < a.Value.length; j++) {
                    var b = a.Value[j];
                    hd[a.Key][b.Key] = [];
                    for (var k = 0; k < b.Value.length; k++) {
                        var hp = b.Value[k];
                        hp.point = new HTMap.CPoint(hp.x, hp.y);
                        hd[a.Key][b.Key].push(hp);
                    }
                }
            }
            return hd;
        }
    }


    /**
     * 此类用来管理密集点的图层和热区 (待整理的类型，暂不可使用)
     */
    DMLayer = Class.create();
    DMLayer.prototype = {
        initialize: function (imgid, updateurl, phm, srcfunc, mapType) {
            this.phm = phm;
            this.srcfunc = srcfunc;
            this.updateurl = updateurl;
            this.mapType = mapType;
            this.imgid = imgid;
        },
        addMarker: function (point, parameters, callback) {
            var me = this;
            parameters = parameters || {};
            var p = {};
            Util.setOptionsValue(p, parameters, {
                rnd: Math.random(),
                imgid: this.imgid,
                point: Util.toJSON(point),
                mode: "add"
            });
            new Ajax.Request(this.updateurl, {
                parameters: p,
                onComplete: function (data) {
                    var d = eval('(' + data.responseText + ')');
                    var ps = me.phm.getPartition(new HTMap.Point(d.x, d.y));
                    d.point = new HTMap.Point(d.x, d.y);
                    me.phm.addHotPots(ps.x, ps.y, d);

                    var updateimgs = [
                        { x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 },
                        { x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 },
                        { x: -1, y: 1 }, { x: 0, y: 1 }, { x: 1, y: 1 }
                    ];
                    var zoom = me.phm.map.model.getZoom().getLevel();
                    for (var i = 0; i < 8; i++) {
                        var offset = updateimgs[i];
                        var t = me.getTile(ps.x + offset.x, ps.y + offset.y);
                        if (t) {
                            t.src = me.srcfunc(zoom, ps.x + offset.x, ps.y + offset.y) + "&rnd=" + Math.random();
                        }
                    }
                    callback(d);
                }
            });
        },
        getTile: function (row, column) {
            var mid = this.phm.map.mapControl.mapDiv.id;
            var zoom = this.phm.map.model.getZoom().getLevel();
            var id = mid + "_zoom_" + zoom + "_tile_" + row + "_" + column;
            var div = document.getElementById(id);
            if (div) {
                var imgs = div.getElementsByTagName("IMG");
                return imgs[this.getLayerIndex()];
            }
        },
        getLayerIndex: function () {
            for (var i = 0; i < this.mapType.SrcFuncs.length; i++) {
                if (this.mapType.SrcFuncs[i] == this.srcfunc) return i;
            }
        },
        delMarker: function (point, parameters, callback) {
            var me = this;
            parameters = parameters || {};
            var p = {};
            Util.setOptionsValue(p, parameters, {
                rnd: Math.random(),
                imgid: this.imgid,
                point: Util.toJSON(point),
                mode: "del"
            });
            new Ajax.Request(this.updateurl, {
                parameters: p,
                onComplete: function (data) {
                    var d = eval('(' + data.responseText + ')');
                    var ps = me.phm.getPartition(new HTMap.Point(d.x, d.y));
                    d.point = new HTMap.Point(d.x, d.y);
                    me.phm.delMarker(ps.x, ps.y, d);

                    var updateimgs = [
                        { x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 },
                        { x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 },
                        { x: -1, y: 1 }, { x: 0, y: 1 }, { x: 1, y: 1 }
                    ];
                    var zoom = me.phm.map.model.getZoom().getLevel();
                    for (var i = 0; i < 8; i++) {
                        var offset = updateimgs[i];
                        var t = me.getTile(ps.x + offset.x, ps.y + offset.y);
                        if (t) {
                            t.src = me.srcfunc(zoom, ps.x + offset.x, ps.y + offset.y) + "&rnd=" + Math.random();
                        }
                    }
                    callback(d);
                }
            });
        },
        updateMarker: function (point, parameters, callback) {
            var me = this;
            parameters = parameters || {};
            var p = {};
            Util.setOptionsValue(p, parameters, {
                rnd: Math.random(),
                imgid: this.imgid,
                point: Util.toJSON(point),
                mode: "del"
            });
            new Ajax.Request(this.updateurl, {
                parameters: p,
                onComplete: function (data) {
                    var d = eval('(' + data.responseText + ')');
                    var ps = me.phm.getPartition(new HTMap.Point(d.x, d.y));
                    d.point = new HTMap.Point(d.x, d.y);
                    me.phm.delMarker(ps.x, ps.y, d);

                    var updateimgs = [
                        { x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 },
                        { x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 },
                        { x: -1, y: 1 }, { x: 0, y: 1 }, { x: 1, y: 1 }
                    ];
                    var zoom = me.phm.map.model.getZoom().getLevel();
                    for (var i = 0; i < 8; i++) {
                        var offset = updateimgs[i];
                        var t = me.getTile(ps.x + offset.x, ps.y + offset.y);
                        if (t) {
                            t.src = me.srcfunc(zoom, ps.x + offset.x, ps.y + offset.y) + "&rnd=" + Math.random();
                        }
                    }
                    callback(d);
                }
            });
        }
    }


})();
(function () {
    /* (待整理的类型，暂不可使用)*/
    HTMap.Hotspot = Class.create();
    HTMap.Hotspot.prototype = {
        mouseMoveIng: false,
        initialize: function (point, opts) {
            Util.setClassEvent(this);
            Util.setOptionsValue(this, opts, {
                text: "",
                offsets: [5, 5, 5, 5],
                userData: null,
                minZoom: Number.MIN_VALUE,
                maxZoom: Number.MAX_VALUE
            });
            this.point = point;
        },
        addToMap: function (map) {
            this.map = map;
            var me = this;

            var mapLeft = Util.getLeft(me.map.mapControl.mapDiv.parentNode);
            var mapTop = Util.getTop(me.map.mapControl.mapDiv.parentNode);

            map.addEventListener("mousemove", function (point, e) {
                if (window.event.button != 0) return;
                var cZoom = me.map.model.getZoom();
                if (cZoom < me.minZoom || cZoom > me.maxZoom) return;

                var mousePx = Util.Projection.FromLatLngToPixel(point.x, point.y, cZoom);

                if (!e)
                    e = window.event;
                if (!e.pageX)
                    e.pageX = e.clientX;
                if (!e.pageY)
                    e.pageY = e.clientY;

                var mapStyleLeft = Util.getValueOfNoPX(me.map.mapControl.mapDiv.style.left);
                var mapStyleTop = Util.getValueOfNoPX(me.map.mapControl.mapDiv.style.top);

                var x0 = e.pageX - mapLeft - mapStyleLeft
                var y0 = e.pageY - mapTop - mapStyleTop

                if (me.isIn(x0, y0, x1, y1)) {
                    if (me.mouseMoveIng) {
                        me.triggerEvent("mousemove", { sender: me });
                    }
                    else {
                        me.mouseMoveIng = true;
                        me.map.mapControl.mapDiv.title = me.text;
                        me.triggerEvent("mouseover", { sender: me });
                        me.map.triggerEvent("hotspotover", { sender: me });
                    }
                }
                else if (me.mouseMoveIng) {
                    me.mouseMoveIng = false;
                    me.map.mapControl.mapDiv.title = "";
                    me.triggerEvent("mouseout", { sender: me });
                    me.map.triggerEvent("hotspotout", { sender: me });
                }
            });

            Event.observe(map.mapControl.mapDiv, "mousedown", function (e) {
                if (me.mouseMoveIng) {
                    me.triggerEvent("mousedown", { sender: me });
                    me.map.triggerEvent("hotspotclick", { sender: me });
                }
            });
        },
        isIn: function (x0, y0, x1, y1) {
            return y0 >= (y1 - this.offsets[0]) &&
                y0 <= (y1 + this.offsets[2]) &&
                x0 >= (x1 - this.offsets[3]) &&
                x0 <= (x1 + this.offsets[1]);
        }
    }

    var PartitionHotspotManager = Class.create();
    PartitionHotspotManager.prototype = {
        initialize: function (map, opts) {
            this.map = map;
            Util.setClassEvent(this);
            Util.setOptionsValue(this, opts, {
                text: "",
                offsets: [5, 5, 5, 5],
                minZoom: Number.MIN_VALUE,
                maxZoom: Number.MAX_VALUE,
                titleField: "text"
            });
            this.hotspots = {};
            this.currentMoveIngPoint = [];
            var me = this;

            var mapLeft = Util.getLeft(me.map.mapControl.mapDiv.parentNode);
            var mapTop = Util.getTop(me.map.mapControl.mapDiv.parentNode);

            map.addEventListener("mousemove", function (e) {
                if (window.event.button != 0) return;
                var cZoom = me.map.model.getZoom();
                if (cZoom < me.minZoom || cZoom > me.maxZoom) return;

                var mousePx = Util.Projection.FromLatLngToPixel(e.point.coord.x, e.point.coord.y, cZoom);
                var x0 = mousePx.x, y0 = mousePx.y;

                //检查鼠标是否停留在上一个热区上
                if (me.currentMoveIngPoint.length) {
                    var newCps = [];
                    var isout = false;
                    for (var i = 0; i < me.currentMoveIngPoint.length; i++) {
                        var cp = me.currentMoveIngPoint[i];
                        var cpx = Util.Projection.FromLatLngToPixel(cp.point.coord.x, cp.point.coord.y, cZoom);
                        if (me.isIn(x0, y0, cpx.x, cpx.y)) {
                            me.triggerEvent("mousemove", { sender: cp });
                            newCps.push(cp);
                        }
                        else {
                            me.triggerEvent("mouseout", { sender: cp });
                            me.map.triggerEvent("hotspotout", { sender: cp });
                            me.map.mapControl.mapDiv.title = "";
                            isout = true;
                        }
                    }
                    if (isout) me.currentMoveIngPoint = newCps;
                }

                //计算该位置属于哪个瓦片瓦片分区
                var wx = parseInt(x0 / HTMap.mapConfig.TileSize);
                var wy = parseInt(y0 / HTMap.mapConfig.TileSize);

                //取得该区域的热区集
                if (!me.hotspots[wx] || !me.hotspots[wx][wy] || me.hotspots[wx][wy].length < 1) return;
                var ps = me.hotspots[wx][wy];
                for (var i = 0; i < ps.length; i++) {
                    var p = ps[i];
                    if (me.currentMoveIngPoint.indexOf(p) >= 0) continue;
                    var px = Util.Projection.FromLatLngToPixel(p.point.coord.x, p.point.coord.y, cZoom);
                    if (me.isIn(x0, y0, px.x, px.y)) {
                        me.currentMoveIngPoint.push(p);
                        me.map.mapControl.mapDiv.title = p[me.titleField];
                        me.triggerEvent("mouseover", { sender: p });
                        me.map.triggerEvent("hotspotover", { sender: p });
                    }
                }
            });

            map.addEventListener("ZoomChanged", function () {
                me.rHotsPots();
            });

            Event.observe(map.mapControl.mapDiv, "mousedown", function (e) {
                if (me.currentMoveIngPoint.length) {
                    for (var i = 0; i < me.currentMoveIngPoint.length; i++) {
                        me.triggerEvent("mousedown", { sender: me.currentMoveIngPoint[i] });
                        me.map.triggerEvent("hotspotclick", { sender: me.currentMoveIngPoint[i] });
                    }
                }
            });
        },
        isIn: function (x0, y0, x1, y1) {
            return y0 >= (y1 - this.offsets[0]) &&
                y0 <= (y1 + this.offsets[2]) &&
                x0 >= (x1 - this.offsets[3]) &&
                x0 <= (x1 + this.offsets[1]);
        },
        addHotPotsByXYObjectArray: function (array) {
            var newHot = (this.hotspots = this.hotspots || {});
            var cZoom = this.map.model.getZoom();
            for (var i = 0, j = array.length; i < j; i++) {
                var xyObj = array[i];
                var p = new HTMap.Point(xyObj.x, xyObj.y);
                xyObj.point = p;
                var px = Util.Projection.FromLatLngToPixel(p.coord.x, p.coord.y, cZoom);
                var partitionX = parseInt(px.x / HTMap.mapConfig.TileSize), partitionY = parseInt(px.y / HTMap.mapConfig.TileSize);
                if (!newHot[partitionX]) newHot[partitionX] = {};
                if (!newHot[partitionX][partitionY]) newHot[partitionX][partitionY] = [];
                newHot[partitionX][partitionY].push(xyObj);
            }

        },
        rHotsPots: function () {
            //地图等级变化的时候，需要重新分区
            var newHot = {};
            var cZoom = this.map.model.getZoom();
            for (var x in this.hotspots) {
                for (var y in this.hotspots[x]) {
                    var list = this.hotspots[x][y];
                    for (var i = 0; i < list.length; i++) {
                        var p = list[i].point;
                        var px = Util.Projection.FromLatLngToPixel(p.coord.x, p.coord.y, cZoom);
                        var partitionX = parseInt(px.x / HTMap.mapConfig.TileSize), partitionY = parseInt(px.y / HTMap.mapConfig.TileSize);
                        if (!newHot[partitionX]) newHot[partitionX] = {};
                        if (!newHot[partitionX][partitionY]) newHot[partitionX][partitionY] = [];
                        newHot[partitionX][partitionY].push(list[i]);
                    }
                }
            }
            this.hotspots = newHot;
        },
        addHotPots: function (partitionX, partitionY, point) {
            if (!this.hotspots[partitionX]) this.hotspots[partitionX] = {};
            if (!this.hotspots[partitionX][partitionY]) this.hotspots[partitionX][partitionY] = [];
            this.hotspots[partitionX][partitionY].push(point);
        },
        getPartition: function (point) {
            var cZoom = this.map.model.getZoom();
            var p = point;
            var x1 = (p.getCoord().x - cZoom.realMapBound.getMinX()) * ((cZoom.getTileCols() * HTMap.mapConfig.TileSize) / cZoom.realMapBound.getWidth());
            var y1 = (cZoom.realMapBound.getMaxY() - p.getCoord().y) * ((cZoom.getTileRows() * HTMap.mapConfig.TileSize) / cZoom.realMapBound.getHeight());
            var partitionX = parseInt(x1 / HTMap.mapConfig.TileSize), partitionY = parseInt(y1 / HTMap.mapConfig.TileSize);
            return { x: partitionX, y: partitionY };
        },
        delHotPots: function (partitionX, partitionY, point) {
            if (!this.hotspots[partitionX]) return
            if (!this.hotspots[partitionX][partitionY]) return
            var ps = this.hotspots[partitionX][partitionY];
            var j = -1;
            for (var i = 0; i < ps.length; i++) {
                if (ps[i].id == point.id) {
                    j = i; break;
                }
            }
            if (j >= 0) {
                ps.splice(j, 1);
                return true;
            }
        }
    }
})();

(function () {
    /*此类表示地图上包含信息的窗口。*/
    HTMap.InfoWindow = Class.create();

    HTMap.InfoWindow.prototype = Object.extend(new Abstract.OverLayer(), {
        initialize: function (content, opts) {
            Util.setOptionsValue(this, opts, {
                width: null,
                height: null,
                title: '',
                content: '',
                position: null,
                maxWidth: '',
                offset: { x: 0, y: 0 },
                enableAutoPan: true,
                enableCloseOnClick: true,
                maxContent: ''
            });
            Util.setClassEvent(this);
            this.content = content;
            this.arrowsCss = {
                left: Util.getValueOfNoPX(Util.getCSSStyleValue(".InfoWindow-cornerDiv-arrows", "left")),
                bottom: Util.getValueOfNoPX(Util.getCSSStyleValue(".InfoWindow-cornerDiv-arrows", "bottom"))
            };
            this.isOpened = false;
        },
        getDivPosition: function () {
            this.sPoint = Util.getScreenPixel(this.position.getCoord(), this.map.model.getZoom());
            var deltaX;
            var deltaY;
            /*此方法依赖div已经呈现，且css中的InfoWindow-cornerDiv-arrows类型的设置没有被破坏*/
            var aLeft = this.arrowsCss.left;
            var aTop = this.div.clientHeight - this.arrowsCss.bottom;
            if (this.offset) {
                deltaX = this.sPoint.x - aLeft + this.offset.x;
                deltaY = this.sPoint.y - aTop + this.offset.y;
            }
            else {
                deltaX = this.sPoint.x - aLeft;
                deltaY = this.sPoint.y - aTop;
            }
            return { x: deltaX, y: deltaY };
        },
        onClickMap: function (e) {
            if (this.enableCloseOnClick) {
                this.close();
            }
        },
        setToMap: function (map) {
            if (!this.div) {
                map = map || this.map;
                this.map = map;
                this.mapDiv = this.mapDiv || Prototype.$(map.mapControl.id);
                this.model = this.model || map.model;
                Event.observe(this.mapDiv, "click", this.onClickMap.bindAsEventListener(this));

                this.div = Util.createDivByOpts({
                    id: Util.createUniqueID("Over_"),
                    className: 'InfoWindow-Div',
                    position: "absolute",
                    width: this.width,
                    height: this.height
                });
                this.maxWidth = this.maxWidth || this.mapDiv.clientWidth;
                this.div.style.maxWidth = this.maxWidth + 'px';

                //用字符串或元素初始化标题div的内部
                this.titleDiv = Util.createDivByOpts({
                    className: 'InfoWindow-titleDiv'
                });
                if (typeof (this.title) == "string") {
                    this.titleDiv.innerHTML = this.title;
                }
                else if (typeof (this.title) == "object") {
                    this.titleDiv.appendChild(this.title);
                }

                //用字符串或元素初始化正文div的内部
                this.contentDiv = Util.createDivByOpts({
                    className: 'InfoWindow-contentDiv'
                });
                if (typeof (this.content) == "string") {
                    this.contentDiv.innerHTML = this.content;
                }
                else if (typeof (this.content) == "object") {
                    this.contentDiv.appendChild(this.content);
                }

                //用字符串或元素初始化最大化正文div的内部
                this.contentMaxDiv = Util.createDivByOpts({
                    className: 'InfoWindow-contentDiv'
                });
                this.contentMaxDiv.style.display = 'none';
                if (this.maxContent) {
                    this._enableMaximize = true;
                    if (typeof (this.maxContent) == "string") {
                        this.contentMaxDiv.innerHTML = this.maxContent;
                    }
                    else if (typeof (this.maxContent) == "object") {
                        this.contentMaxDiv.appendChild(this.maxContent);
                    }
                }

                /*组成信息框的边框div*/
                var cornerDiv1 = Util.createDivByOpts({
                    className: 'InfoWindow-cornerDiv-top-left'
                });
                var cornerDiv2 = Util.createDivByOpts({
                    className: 'InfoWindow-cornerDiv-top-right'
                });
                var cornerDiv3 = Util.createDivByOpts({
                    className: 'InfoWindow-cornerDiv-bottom-left'
                });
                var cornerDiv4 = Util.createDivByOpts({
                    className: 'InfoWindow-cornerDiv-bottom-right'
                });
                var cornerDiv5 = Util.createDivByOpts({
                    className: 'InfoWindow-cornerDiv-arrows'
                });
                var cornerDiv6 = Util.createDivByOpts({
                    className: 'InfoWindow-cornerDiv-top'
                });
                var cornerDiv7 = Util.createDivByOpts({
                    className: 'InfoWindow-cornerDiv-left'
                });
                var cornerDiv8 = Util.createDivByOpts({
                    className: 'InfoWindow-cornerDiv-right'
                });
                var cornerDiv9 = Util.createDivByOpts({
                    className: 'InfoWindow-cornerDiv-bottom'
                });

                this.div.appendChild(cornerDiv1);
                this.div.appendChild(cornerDiv2);
                this.div.appendChild(cornerDiv3);
                this.div.appendChild(cornerDiv4);
                this.div.appendChild(cornerDiv6);
                this.div.appendChild(cornerDiv7);
                this.div.appendChild(cornerDiv8);
                this.div.appendChild(cornerDiv9);
                this.div.appendChild(cornerDiv5);

                /*标题和正文*/
                this.div.appendChild(this.titleDiv);
                this.div.appendChild(this.contentDiv);
                this.div.appendChild(this.contentMaxDiv);

                /*关闭按钮*/
                var closeDiv = Util.createDivByOpts({
                    className: 'InfoWindow-close'
                });
                closeDiv.setAttribute("title", "关闭");
                Event.observe(closeDiv, "click", this.closeInfoWindow.bindAsEventListener(this));
                Event.observe(closeDiv, "touchend", this.closeInfoWindow.bindAsEventListener(this));
                this.div.appendChild(closeDiv);

                /*最大化按钮*/
                this.maxDiv = Util.createDivByOpts({
                    className: 'InfoWindow-max'
                });
                this.maxDiv.setAttribute("title", "最大化");
                if (this.maxContent) {
                    this.maxDiv.style.display = '';
                }
                else {
                    this.maxDiv.style.display = 'none';
                }
                this.maxed = false;
                Event.observe(this.maxDiv, "click", this.maxButtonClick.bindAsEventListener(this));
                this.div.appendChild(this.maxDiv);

                this.mapDiv.appendChild(this.div)

                this.isOpened = true;

                Event.observe(this.div, "mousemove", function (e) {
                    if (e.stopPropagation) e.stopPropagation();
                    e.cancelBubble = true;
                });
                Event.observe(this.div, "mousedown", function (e) {//此处尤其不能使用Event.stop来中断事件冒泡，会使得嵌入正文中的文本输入无法进行
                    if (e.stopPropagation) e.stopPropagation();
                    e.cancelBubble = true;
                });
                Event.observe(this.div, "click", function (e) {
                    if (e.stopPropagation) e.stopPropagation();
                    e.cancelBubble = true;
                });
                Event.observe(this.div, "dblclick", function (e) {
                    if (e.stopPropagation) e.stopPropagation();
                    e.cancelBubble = true;
                });
            }
            /*根据正文内容调整信息框的高宽和偏移*/
            this.redraw();
        },
        close: function () {
            if (!this.isOpened) return;
            this.div.style.display = "none";
            this.isOpened = false;
            this.triggerEvent("close", { sender: this });
        },
        maxButtonClick: function () {
            if (this.maxed) {
                this.restore();
            }
            else {
                this.maximize();
            }
        },
        closeInfoWindow: function () {
            if (this.div) {
                if (this.triggerEvent("clickclose", { sender: this })) {
                    this.close();
                }
            }
        },
        /**
         * 在地图上的指定位置打开信息框
         * @param map
         * @param point
         */
        open: function (map, point) {
            if(this.isOpened){
                this.close();
            }
            this.position = point;
            if (this.div) {
                this.div.style.display = "";
                this.setPosition(point);
            }
            else {
                this.insert(map);
            }
            this.isOpened = true;
            this.triggerEvent("open", { sender: this });
        },
        dispose: function () {
            if (this.disposed) return;
            if (this.div) {
                this.div.parentNode.removeChild(this.div);
                this.div = null;
                this.disposed = true;
            }
        },

        /**
         * 设置窗口的宽度
         * @param {Number} width
         */
        setWidth: function (width) {
            this.width = width;
            if (this.div) {
                this.div.style.width = this.width + 'px';
            }
        },
        /**
         * 设置窗口的高度
         * @param {Number} height
         */
        setHeight: function (height) {
            this.height = height;
            if (this.div) {
                this.div.style.height = this.height + 'px';
            }
        },
        /**
         * 重绘信息窗口，当信息窗口内容发生变化或打开窗口时调用。
         */
        redraw: function () {
            if (!this.div) return;
            var npx = this.getDivPosition();
            this.div.style.left = npx.x + 'px';
            this.div.style.top = npx.y + 'px';

            /*自动平移地图来适应信息框的显示*/
            if (this.enableAutoPan) {
                var b = this.div.getBoundingClientRect();
                var mb = this.mapDiv.parentNode.getBoundingClientRect();
                var p = 10;
                var xNumber = 0, yNumber = 0;
                if (b.left - mb.left < 0) {
                    xNumber = -b.left + mb.left + p;
                }
                else if (b.right - mb.right > 0) {
                    xNumber = -b.right + mb.right - p;
                }
                if (b.top - mb.top < 0) {
                    yNumber = -b.top + mb.top + p;
                }
                else if (b.bottom - mb.bottom > 0) {
                    yNumber = -b.bottom + mb.bottom - p;
                }
                if (xNumber || yNumber) {
                    this.map.panBy(xNumber, yNumber, { noAnimation: false });
                }
            }
        },
        /**
         * 设置窗口的标题
         * @param {String|HTMLElement} title
         */
        setTitle: function (title) {
            this.title = title;
            if (this.div) {
                if (typeof (this.title) == "string") {
                    this.titleDiv.innerHTML = this.title;
                }
                else if (typeof (this.title) == "object") {
                    if(this.title instanceof HTMLElement){
                        this.titleDiv.innerHTML = '';
                        this.titleDiv.appendChild(this.title);
                    }
                    else{
                        this.titleDiv.innerHTML = this.title.toString();
                    }
                }
            }
        },
        /**
         * 返回信息窗口标题。
         * @return {String|HTMLElement}
         */
        getTitle: function () {
            return this.title;
        },
        /**
         * 设置信息窗口内容
         * @param {String|HTMLElement} content
         */
        setContent: function (content) {
            this.content = content;
            if (this.div) {
                if (typeof (this.content) == "string") {
                    this.contentDiv.innerHTML = this.content;
                }
                else if (typeof (this.content) == "object") {
                    if(this.content instanceof HTMLElement){
                        this.contentDiv.innerHTML = '';
                        this.contentDiv.appendChild(this.content);
                    }
                    else{
                        this.contentDiv.innerHTML = this.content.toString();
                    }
                }
                if (!this.maxed) this.redraw();
            }
        },
        /**
         * 返回信息窗口内容。
         * @return {String}
         */
        getContent: function () {
            return this.content;
        },
        /**
         * 返回信息窗口的位置。
         * @return {Point}
         */
        getPosition: function () {
            return this.position;
        },
        /**
         * 设置信息窗口的位置
         * @param {Point} point
         */
        setPosition: function (point) {
            this.position = point;
            this.redraw();
        },
        /**
         * 启用窗口最大化功能。需要设置最大化后信息窗口里的内容，该接口才生效。
         */
        enableMaximize: function () {
            this._enableMaximize = true;
        },
        /**
         * 禁用窗口最大化功能。
         */
        disableMaximize: function () {
            this._enableMaximize = false;
        },
        /**
         * 返回信息窗口的打开状态。
         * @return {Boolean}
         */
        isOpen: function () {
            return this.isOpened;
        },
        /**
         * 信息窗口最大化时所显示内容，支持HTML内容
         * @param {String} content
         */
        setMaxContent: function (content) {
            this.maxContent = content;
            if (this.div) {
                if (typeof (this.maxContent) == "string") {
                    this.contentMaxDiv.innerHTML = this.maxContent;
                }
                else if (typeof (this.maxContent) == "object") {
                    this.contentMaxDiv.innerHTML = '';
                    this.contentMaxDiv.appendChild(this.maxContent);
                }
                if (this.maxed) this.redraw();
            }
        },
        /**
         * 最大化信息窗口
         */
        maximize: function () {
            if (!this._enableMaximize) return;
            if (!this.maxed) {
                this.contentDiv.style.display = 'none';
                this.contentMaxDiv.style.display = '';
                this.maxed = true;
                Util.removeClass(this.maxDiv, 'InfoWindow-max');
                Util.addClass(this.maxDiv, 'InfoWindow-min');
                this.maxDiv.setAttribute("title", "还原");
                this.redraw();
                this.triggerEvent("maximize", { sender: this });
            }
        },
        /**
         * 还原信息窗口
         */
        restore: function () {
            if (this.maxed) {
                this.contentMaxDiv.style.display = 'none';
                this.contentDiv.style.display = '';
                this.maxed = false;
                Util.removeClass(this.maxDiv, 'InfoWindow-min');
                Util.addClass(this.maxDiv, 'InfoWindow-max');
                this.maxDiv.setAttribute("title", "最大化");
                this.redraw();
                this.triggerEvent("restore", { sender: this });
            }
        },
        /**
         * 设置打开信息窗口时地图是否自动平移
         * @param autoPan
         */
        setEnableAutoPan: function (autoPan) {
            this.enableAutoPan = autoPan;
        },
        /**
         * 设置点击地图时是否关闭信息窗口
         * @param closeOnClick
         */
        setEnableCloseOnClick: function (closeOnClick) {
            this.enableCloseOnClick = closeOnClick;
        }
    });
})();
(function () {

    HTMap.Marker = Class.create();

    HTMap.Marker.prototype = Object.extend(new Abstract.OverLayer(), {
        initialize: function (point, opts) {
            this.position = point;
            Util.setOptionsValue(this, opts, {
                cursor: "",               //鼠标移动到标注上的时候显示的鼠标样式
                offset: null,        //标注的位置偏移值。
                icon: null,               //标注所用的图标对象
                enableDragging: false,  //是否启用拖拽，默认为false
                enableClicking: true,   //是否响应点击事件
                raiseOnDrag: false,     //拖拽标注时，标注是否开启离开地图表面效果
                draggingCursor: "",     //拖拽标注时的鼠标指针样式。此属性值需遵循CSS的cursor属性规范
                shadow: null,            //阴影图标
                title: "",                //鼠标移到marker上的显示内容
                label:""                 //标注的标签
            });
            this.id = Util.createUniqueID("Over_Marker_");
            Util.setClassEvent(this);
            this.isRaphaelObject = false;
        },
        getDivPosition: function () {
            this.sPoint = Util.getScreenPixel(this.position.getCoord(), this.map.model.getZoom());
            var deltaX;
            var deltaY;
            if (this.offset) {
                deltaX = this.sPoint.x + this.offset.x;
                deltaY = this.sPoint.y + this.offset.y;
            }
            else if (this.icon) {
                this.offset = { x: -this.icon.width / 2, y: -this.icon.height };
                deltaX = this.sPoint.x + this.offset.x;
                deltaY = this.sPoint.y + this.offset.y;
            }
            else {
                deltaX = this.sPoint.x;
                deltaY = this.sPoint.y;
            }
            return { x: deltaX, y: deltaY };
        },
        getPositionByPx: function (px) {
            px.x = px.x - this.offset.x;
            px.y = px.y - this.offset.y;
            return Util.getCoordinateByPixel(px, this.model.getZoom()).getPoint();
        },
        setToMap: function (map) {
            map = map || this.map;
            this.map = map;
            this.mapDiv = this.mapDiv || Prototype.$(map.mapControl.id);
            this.model = this.model || map.model;

            var xy = this.getDivPosition();
            var deltaX = xy.x;
            var deltaY = xy.y;

            if (!this.div) {
                //创建标注div
                this.div = Util.createDivByOpts({
                    id: this.id,
                    left: deltaX,
                    top: deltaY,
                    position: "absolute"
                });
                this.div.style.zIndex = 400;
                this.div.style.cursor = this.cursor || "pointer";
                this.div.title = this.title || "";
                //根据参数初始化标注内部
                if (this.icon) {
                    //添加阴影图标
                    if (this.shadow) {
                        this.shadowImg = this.shadow.createImgElement();
                        this.div.appendChild(this.shadowImg);
                    }
                    this.div.appendChild(this.IconImg = this.icon.createImgElement());
                }
                else {
                    Util.addClass(this.div, 'DefaultMarker');
                }
                this.mapDiv.appendChild(this.div);
                //可拖动
                if (this.enableDragging) {
                    var me = this;
                    Util.setElementDrag(this.div, {
                        startDrag: function (e, x, y) { me.startDrag(e, x, y); },
                        dragging: function (e, x, y) { me.dragging(e, x, y); },
                        endDrag: function (e, x, y) { me.endDrag(e, x, y); }
                    });
                }
                //鼠标事件
                Event.observe(this.div, "click", this.click.bindAsEventListener(this));
                Event.observe(this.div, "dblclick", this.dblclick.bindAsEventListener(this));
                Event.observe(this.div, "mousedown", this.mousedown.bindAsEventListener(this));
                Event.observe(this.div, "mouseup", this.mouseup.bindAsEventListener(this));
                Event.observe(this.div, "mouseout", this.mouseout.bindAsEventListener(this));
                Event.observe(this.div, "mouseover", this.mouseover.bindAsEventListener(this));

                var touchEvents =[{event:"touchend",mEvent:"click"},{event:"touchstart",mEvent:"mousedown"}];
                function getTouchHandler(eventInfo){
                    return function(e){
                        if (this.enableClicking) {
                            this.triggerEvent(eventInfo.event, { sender: this, e: e });
                            this.triggerEvent(eventInfo.mEvent, { sender: this, e: e });
                        }
                    }
                }
                for(var i=0;i< touchEvents.length;i++){
                    Event.observe(this.div, touchEvents[i].event, getTouchHandler(touchEvents[i]).bindAsEventListener(this));
                }
            }
            else {
                this.div.style.top = deltaY + "px";
                this.div.style.left = deltaX + "px";
            }
            if(this.label && !this.lableDiv)this.setLabel(this.label);
        },
        hide: function () {
            this.div.style.display = "none";
            this.closeInfoWindow();
        },
        remove: function () {
            if (this.model == null)
                return;
            if (this.model.overlays) {
                this.model.overlays = this.model.overlays.without(this)
                this.mapDiv.removeChild(this.div);
            }
            this.closeInfoWindow();
        },

        /*触发事件*/
        click: function (e) {
            if (this.enableClicking) {
                this.triggerEvent("click", { sender: this, e: e });//////暂时没有判断左右键
            }
        },
        dblclick: function (e) {
            if (this.enableClicking) {
                this.triggerEvent("dblclick", { sender: this, e: e });
            }
        },
        mousedown: function (e) {
            this.triggerEvent("mousedown", { sender: this, e: e });
        },
        mouseup: function (e) {
            this.triggerEvent("mouseup", { sender: this, e: e });
        },
        mouseout: function (e) {
            this.triggerEvent("mouseout", { sender: this, e: e });
        },
        mouseover: function (e) {
            this.triggerEvent("mouseover", { sender: this, e: e });
        },
        /*拖动事件*/
        startDrag: function (e, x, y) {
            if (this.draggingCursor) {
                this.div.style.cursor = this.draggingCursor;
            }
            var px = this.getPositionByPx({ x: x, y: y });
            this.triggerEvent("dragstart", { sender: this, src: e, point: px });
            this.closeInfoWindow();
        },
        dragging: function (e, x, y) {
            var px = this.getPositionByPx({ x: x, y: y });
            this.position = px;
            this.triggerEvent("dragging", { sender: this, src: e, point: px });
        },
        endDrag: function (e) {
            this.div.style.cursor = this.cursor || "pointer";
            this.triggerEvent("dragend", { sender: this, src: e });
        },

        /*以下为参照百度api定义的成员*/
        /**
         * @description 在此标注上打开一个信息框
         * @param {InfoWindow} infoWindow
         */
        openInfoWindow: function (infoWindow) {
            if(this.infoWindow && this.infoWindow != infoWindow && this.infoWindow.isOpen()){
                this.closeInfoWindow();
            }
            this.infoWindow = infoWindow;
            this.infoWindow.open(this.map, this.position);
            var me = this;
            function removeInfoWindow(){
                infoWindow.removeEventListener("close",removeInfoWindow);
                me.infoWindow = null;
            }
            infoWindow.addEventListener("close",removeInfoWindow);
        },
        /**
         * @description 关闭标注的信息框
         */
        closeInfoWindow: function () {
            if (this.infoWindow && this.infoWindow.isOpen()) {
                this.infoWindow.close();
            }
        },
        /**
         * @description 返回标注所用的图标对象
         * @return {Icon}
         */
        getIcon: function () {
            return this.icon;
        },
        /**
         * @description 设置标注的图标
         * @param {Icon} icon
         */
        setIcon: function (icon) {
            if (!this.div) {
                this.icon = icon;
                return;
            }
            if (icon) {
                if (this.icon && this.IconImg) {
                    icon.updateImgElement(this.IconImg);
                }
                else {
                    this.div.appendChild(this.IconImg = icon.createImgElement(false));
                }
            }
            this.icon = icon;
        },
        /**
         * 设置标注的位置
         * @param {Point} position
         */
        setPosition: function (position) {
            this.position = position;
            if (this.div) {
                var xy = this.getDivPosition();
                this.div.style.left = xy.x + 'px';
                this.div.style.top = xy.y + 'px';
            }
            if (this.infoWindow) {
                this.infoWindow.setPosition(this.position);
            }
        },
        /**
         * 返回标注的位置
         * @return {Point}
         */
        getPosition: function () { return this.position; },
        /**
         * 设置标注的偏移量
         * @param x
         * @param y
         */
        setOffset: function (x, y) {
            this.offset = { x: x, y: y };
            if (this.div) {
                var xy = this.getDivPosition();
                this.div.style.left = xy.x + 'px';
                this.div.style.top = xy.y + 'px';
            }
        },
        /**
         * 获取标注的偏移量
         * @return {*}
         */
        getOffset: function () {
            return this.offset;
        },
        /**
         * 获取标注的文本层div
         * @return {*}
         */
        getLabel: function () { return this.lableDiv; },
        /**
         * 设置标注文本层HTML内容
         * @param labelHtml
         */
        setLabel: function (labelHtml) {
            if (!this.div) {
                this.labelHtml = labelHtml;
                return;
            }
            if (!this.lableDiv) {
                this.lableDiv = document.createElement('div');
                this.lableDiv.style.position = "absolute";
                this.lableDiv.style.zIndex = 400;
                this.lableDiv.innerHTML = labelHtml;
                this.div.appendChild(this.lableDiv);
            }
            this.lableDiv.innerHTML = labelHtml;
            this.labelHtml = labelHtml;
        },
        /**
         * 设置鼠标移动到标注上时显示的文字
         * @param title
         */
        setTitle: function (title) {
            this.title = title;
            if (this.div) this.div.title = title;
        },
        /**
         * 获取鼠标移动到标注上时显示的文字
         * @return {*}
         */
        getTitle: function () { return this.title },
        /**
         * 将该标注提示到最顶层
         * @param {Boolean} isTop
         */
        setTop: function (isTop) {
            if (this.div) this.div.style.zIndex = isTop ? 400 : 399;
        },
        /**
         * 开启标注拖拽功能
         */
        enableDragging: function () {
            if (!this.enableDragging) {
                this.enableDragging = true;
                var me = this;
                if (this.div) Util.setElementDrag(this.div, {
                    startDrag: function (e, x, y) { me.startDrag(e, x, y); },
                    dragging: function (e, x, y) { me.dragging(e, x, y); },
                    endDrag: function (e, x, y) { me.endDrag(e, x, y); }
                });
            }
        },
        /**
         * 禁用标注拖拽功能
         */
        disableDragging: function () {
            this.enableDragging = false;
            if (this.div) this.div.setEnableDragging(false);
        },
        /**
         * 添加右键菜单
         * @param {ContextMenu} menu
         */
        addContextMenu: function (menu) {
            if (this.contextMenu) {
                this.contextMenu.dispose();
                this.contextMenu = null;
            }
            menu.bindElement(this.div);
            this.contextMenu = menu;
        },
        /**
         * 移除右键菜单
         */
        removeContextMenu: function () {
            if (this.contextMenu) this.contextMenu.dispose();
        },
        /**
         * 设置阴影图标
         * @param {Icon} shadow
         */
        setShadow: function (shadow) {
            this.shadow = shadow;
            if (this.shadowImg) {
                this.shadow.updateImgElement(this.shadowImg);
            }
            else {
                this.shadowImg = this.shadow.createImgElement();
                if (this.IconImg) {
                    this.div.insertBefore(this.shadowImg, this.IconImg);
                }
                else {
                    this.div.appendChild(this.shadowImg);
                }
            }
        },
        /**
         * 获取阴影图标
         * @return {Icon}
         */
        getShadow: function () {
            return this.shadow;
        }
    });

    HTMap.Icon = Class.create();
    HTMap.Icon.prototype = {
        initialize: function (w, h, src) {
            this.width = w;
            this.height = h;
            this.src = src;
        },
        createImgElement: function () {
            var imgelm = document.createElement('img');
            imgelm.style.width = this.width + 'px';
            imgelm.style.height = this.height + 'px'
            imgelm.style.position = "absolute";
            imgelm.style.top = '0px';
            imgelm.style.left = '0px';
            imgelm.src = this.src;
            return imgelm;
        },
        updateImgElement: function (img) {
            img.style.width = this.width + 'px';
            img.style.height = this.height + 'px'
            img.src = this.src;
        }
    };
})();

/**
 * @fileoverview MarkerClusterer标记聚合器用来解决加载大量点要素到地图上产生覆盖现象的问题，并提高性能。
 * 主入口类是<a href="symbols/BMapLib.MarkerClusterer.html">MarkerClusterer</a>，
 * 基于Baidu Map API 1.2。
 *
 * @author Baidu Map Api Group
 * @version 1.2
 */


/**
 * @namespace BMap的所有library类均放在BMapLib命名空间下
 */
var BMapLib = window.BMapLib = BMapLib || {};
(function(){

    /**
     * 获取一个扩展的视图范围，把上下左右都扩大一样的像素值。
     * @param {Map} map BMap.Map的实例化对象
     * @param {BMap.Bounds} bounds BMap.Bounds的实例化对象
     * @param {Number} gridSize 要扩大的像素值
     *
     * @return {BMap.Bounds} 返回扩大后的视图范围。
     */
    var getExtendedBounds = function(map, bounds, gridSize){
        bounds = cutBoundsInRange(bounds);
        var pixelNE = map.pointToPixel(bounds.getNorthEast());
        var pixelSW = map.pointToPixel(bounds.getSouthWest());
        pixelNE.x += gridSize;
        pixelNE.y -= gridSize;
        pixelSW.x -= gridSize;
        pixelSW.y += gridSize;
        var newNE = map.pixelToPoint(pixelNE);
        var newSW = map.pixelToPoint(pixelSW);
        return new BMap.Bounds(newSW, newNE);
    };

    /**
     * 按照百度地图支持的世界范围对bounds进行边界处理
     * @param {BMap.Bounds} bounds BMap.Bounds的实例化对象
     *
     * @return {BMap.Bounds} 返回不越界的视图范围
     */
    var cutBoundsInRange = function (bounds) {
        var maxX = getRange(bounds.getNorthEast().lng, -180, 180);
        var minX = getRange(bounds.getSouthWest().lng, -180, 180);
        var maxY = getRange(bounds.getNorthEast().lat, -74, 74);
        var minY = getRange(bounds.getSouthWest().lat, -74, 74);
        return new BMap.Bounds(new BMap.Point(minX, minY), new BMap.Point(maxX, maxY));
    };

    /**
     * 对单个值进行边界处理。
     * @param {Number} i 要处理的数值
     * @param {Number} min 下边界值
     * @param {Number} max 上边界值
     *
     * @return {Number} 返回不越界的数值
     */
    var getRange = function (i, mix, max) {
        mix && (i = Math.max(i, mix));
        max && (i = Math.min(i, max));
        return i;
    };

    /**
     * 判断给定的对象是否为数组
     * @param {Object} source 要测试的对象
     *
     * @return {Boolean} 如果是数组返回true，否则返回false
     */
    var isArray = function (source) {
        return '[object Array]' === Object.prototype.toString.call(source);
    };

    /**
     * 返回item在source中的索引位置
     * @param {Object} item 要测试的对象
     * @param {Array} source 数组
     *
     * @return {Number} 如果在数组内，返回索引，否则返回-1
     */
    var indexOf = function(item, source){
        var index = -1;
        if(isArray(source)){
            if (source.indexOf) {
                index = source.indexOf(item);
            } else {
                for (var i = 0, m; m = source[i]; i++) {
                    if (m === item) {
                        index = i;
                        break;
                    }
                }
            }
        }
        return index;
    };

    /**
     *@exports MarkerClusterer as BMapLib.MarkerClusterer
     */
    var MarkerClusterer =
    /**
     * MarkerClusterer
     * @class 用来解决加载大量点要素到地图上产生覆盖现象的问题，并提高性能
     * @constructor
     * @param {Map} map 地图的一个实例。
     * @param {Json Object} options 可选参数，可选项包括：<br />
     *    markers {Array<Marker>} 要聚合的标记数组<br />
     *    girdSize {Number} 聚合计算时网格的像素大小，默认60<br />
     *    maxZoom {Number} 最大的聚合级别，大于该级别就不进行相应的聚合<br />
     *    minClusterSize {Number} 最小的聚合数量，小于该数量的不能成为一个聚合，默认为2<br />
     *    isAverangeCenter {Boolean} 聚合点的落脚位置是否是所有聚合在内点的平均值，默认为否，落脚在聚合内的第一个点<br />
     *    styles {Array<IconStyle>} 自定义聚合后的图标风格，请参考TextIconOverlay类<br />
     */
        BMapLib.MarkerClusterer = function(map, options){
            if (!map){
                return;
            }
            this._map = map;
            this._markers = [];
            this._clusters = [];

            var opts = options || {};
            this._gridSize = opts["gridSize"] || 60;
            this._maxZoom = opts["maxZoom"] || 18;
            this._minClusterSize = opts["minClusterSize"] || 2;
            this._isAverageCenter = false;
            if (opts['isAverageCenter'] != undefined) {
                this._isAverageCenter = opts['isAverageCenter'];
            }
            this._styles = opts["styles"] || [];

            var that = this;
            this._map.addEventListener("zoomend",function(){
                that._redraw();
            });

            this._map.addEventListener("moveend",function(){
                that._redraw();
            });

            var mkrs = opts["markers"];
            isArray(mkrs) && this.addMarkers(mkrs);
        };

    /**
     * 添加要聚合的标记数组。
     * @param {Array<Marker>} markers 要聚合的标记数组
     *
     * @return 无返回值。
     */
    MarkerClusterer.prototype.addMarkers = function(markers){
        for(var i = 0, len = markers.length; i <len ; i++){
            this._pushMarkerTo(markers[i]);
        }
        this._createClusters();
    };

    /**
     * 把一个标记添加到要聚合的标记数组中
     * @param {BMap.Marker} marker 要添加的标记
     *
     * @return 无返回值。
     */
    MarkerClusterer.prototype._pushMarkerTo = function(marker){
        var index = indexOf(marker, this._markers);
        if(index === -1){
            marker.isInCluster = false;
            this._markers.push(marker);//Marker拖放后enableDragging不做变化，忽略
        }
    };

    /**
     * 添加一个聚合的标记。
     * @param {BMap.Marker} marker 要聚合的单个标记。
     * @return 无返回值。
     */
    MarkerClusterer.prototype.addMarker = function(marker) {
        this._pushMarkerTo(marker);
        this._createClusters();
    };

    /**
     * 根据所给定的标记，创建聚合点
     * @return 无返回值
     */
    MarkerClusterer.prototype._createClusters = function(){
        var mapBounds = this._map.getBounds();
        var extendedBounds = getExtendedBounds(this._map, mapBounds, this._gridSize);
        for(var i = 0, marker; marker = this._markers[i]; i++){
            if(!marker.isInCluster && extendedBounds.containsPoint(marker.getPosition()) ){
                this._addToClosestCluster(marker);
            }
        }
    };

    /**
     * 根据标记的位置，把它添加到最近的聚合中
     * @param {BMap.Marker} marker 要进行聚合的单个标记
     *
     * @return 无返回值。
     */
    MarkerClusterer.prototype._addToClosestCluster = function (marker){
        var distance = 4000000;
        var clusterToAddTo = null;
        var position = marker.getPosition();
        for(var i = 0, cluster; cluster = this._clusters[i]; i++){
            var center = cluster.getCenter();
            if(center){
                var d = this._map.getDistance(center, marker.getPosition());
                if(d < distance){
                    distance = d;
                    clusterToAddTo = cluster;
                }
            }
        }

        if (clusterToAddTo && clusterToAddTo.isMarkerInClusterBounds(marker)){
            clusterToAddTo.addMarker(marker);
        } else {
            var cluster = new Cluster(this);
            cluster.addMarker(marker);
            this._clusters.push(cluster);
        }
    };

    /**
     * 清除上一次的聚合的结果
     * @return 无返回值。
     */
    MarkerClusterer.prototype._clearLastClusters = function(){
        for(var i = 0, cluster; cluster = this._clusters[i]; i++){
            cluster.remove();
        }
        this._clusters = [];//置空Cluster数组
        this._removeMarkersFromCluster();//把Marker的cluster标记设为false
    };

    /**
     * 清除某个聚合中的所有标记
     * @return 无返回值
     */
    MarkerClusterer.prototype._removeMarkersFromCluster = function(){
        for(var i = 0, marker; marker = this._markers[i]; i++){
            marker.isInCluster = false;
        }
    };

    /**
     * 把所有的标记从地图上清除
     * @return 无返回值
     */
    MarkerClusterer.prototype._removeMarkersFromMap = function(){
        for(var i = 0, marker; marker = this._markers[i]; i++){
            marker.isInCluster = false;
            this._map.removeOverlay(marker);
        }
    };

    /**
     * 删除单个标记
     * @param {BMap.Marker} marker 需要被删除的marker
     *
     * @return {Boolean} 删除成功返回true，否则返回false
     */
    MarkerClusterer.prototype._removeMarker = function(marker) {
        var index = indexOf(marker, this._markers);
        if (index === -1) {
            return false;
        }
        this._map.removeOverlay(marker);
        this._markers.splice(index, 1);
        return true;
    };

    /**
     * 删除单个标记
     * @param {BMap.Marker} marker 需要被删除的marker
     *
     * @return {Boolean} 删除成功返回true，否则返回false
     */
    MarkerClusterer.prototype.removeMarker = function(marker) {
        var success = this._removeMarker(marker);
        if (success) {
            this._clearLastClusters();
            this._createClusters();
        }
        return success;
    };

    /**
     * 删除一组标记
     * @param {Array<BMap.Marker>} markers 需要被删除的marker数组
     *
     * @return {Boolean} 删除成功返回true，否则返回false
     */
    MarkerClusterer.prototype.removeMarkers = function(markers) {
        var success = false;
        for (var i = 0; i < markers.length; i++) {
            var r = this._removeMarker(markers[i]);
            success = success || r;
        }

        if (success) {
            this._clearLastClusters();
            this._createClusters();
        }
        return success;
    };

    /**
     * 从地图上彻底清除所有的标记
     * @return 无返回值
     */
    MarkerClusterer.prototype.clearMarkers = function() {
        this._clearLastClusters();
        this._removeMarkersFromMap();
        this._markers = [];
    };

    /**
     * 重新生成，比如改变了属性等
     * @return 无返回值
     */
    MarkerClusterer.prototype._redraw = function () {
        this._clearLastClusters();
        this._createClusters();
    };

    /**
     * 获取网格大小
     * @return {Number} 网格大小
     */
    MarkerClusterer.prototype.getGridSize = function() {
        return this._gridSize;
    };

    /**
     * 设置网格大小
     * @param {Number} size 网格大小
     * @return 无返回值
     */
    MarkerClusterer.prototype.setGridSize = function(size) {
        this._gridSize = size;
        this._redraw();
    };

    /**
     * 获取聚合的最大缩放级别。
     * @return {Number} 聚合的最大缩放级别。
     */
    MarkerClusterer.prototype.getMaxZoom = function() {
        return this._maxZoom;
    };

    /**
     * 设置聚合的最大缩放级别
     * @param {Number} maxZoom 聚合的最大缩放级别
     * @return 无返回值
     */
    MarkerClusterer.prototype.setMaxZoom = function(maxZoom) {
        this._maxZoom = maxZoom;
        this._redraw();
    };

    /**
     * 获取聚合的样式风格集合
     * @return {Array<IconStyle>} 聚合的样式风格集合
     */
    MarkerClusterer.prototype.getStyles = function() {
        return this._styles;
    };

    /**
     * 设置聚合的样式风格集合
     * @param {Array<IconStyle>} styles 样式风格数组
     * @return 无返回值
     */
    MarkerClusterer.prototype.setStyles = function(styles) {
        this._styles = styles;
        this._redraw();
    };

    /**
     * 获取单个聚合的最小数量。
     * @return {Number} 单个聚合的最小数量。
     */
    MarkerClusterer.prototype.getMinClusterSize = function() {
        return this._minClusterSize;
    };

    /**
     * 设置单个聚合的最小数量。
     * @param {Number} size 单个聚合的最小数量。
     * @return 无返回值。
     */
    MarkerClusterer.prototype.setMinClusterSize = function(size) {
        this._minClusterSize = size;
        this._redraw();
    };

    /**
     * 获取单个聚合的落脚点是否是聚合内所有标记的平均中心。
     * @return {Boolean} true或false。
     */
    MarkerClusterer.prototype.isAverageCenter = function() {
        return this._isAverageCenter;
    };

    /**
     * 获取聚合的Map实例。
     * @return {Map} Map的示例。
     */
    MarkerClusterer.prototype.getMap = function() {
        return this._map;
    };

    /**
     * 获取所有的标记数组。
     * @return {Array<Marker>} 标记数组。
     */
    MarkerClusterer.prototype.getMarkers = function() {
        return this._markers;
    };

    /**
     * 获取聚合的总数量。
     * @return {Number} 聚合的总数量。
     */
    MarkerClusterer.prototype.getClustersCount = function() {
        var count = 0;
        for(var i = 0, cluster; cluster = this._clusters[i]; i++){
            cluster.isReal() && count++;
        }
        return count;
    };

    /**
     * @ignore
     * Cluster
     * @class 表示一个聚合对象，该聚合，包含有N个标记，这N个标记组成的范围，并有予以显示在Map上的TextIconOverlay等。
     * @constructor
     * @param {MarkerClusterer} markerClusterer 一个标记聚合器示例。
     */
    function Cluster(markerClusterer){
        this._markerClusterer = markerClusterer;
        this._map = markerClusterer.getMap();
        this._minClusterSize = markerClusterer.getMinClusterSize();
        this._isAverageCenter = markerClusterer.isAverageCenter();
        this._center = null;//落脚位置
        this._markers = [];//这个Cluster中所包含的markers
        this._gridBounds = null;//以中心点为准，向四边扩大gridSize个像素的范围，也即网格范围
        this._isReal = false; //真的是个聚合

        this._clusterMarker = new BMapLib.TextIconOverlay(this._center, this._markers.length, {"styles":this._markerClusterer.getStyles()});
        //this._map.addOverlay(this._clusterMarker);
    }

    /**
     * 向该聚合添加一个标记。
     * @param {Marker} marker 要添加的标记。
     * @return 无返回值。
     */
    Cluster.prototype.addMarker = function(marker){
        if(this.isMarkerInCluster(marker)){
            return false;
        }//也可用marker.isInCluster判断,外面判断OK，这里基本不会命中

        if (!this._center){
            this._center = marker.getPosition();
            this.updateGridBounds();//
        } else {
            if(this._isAverageCenter){
                var l = this._markers.length + 1;
                var lat = (this._center.lat * (l - 1) + marker.getPosition().lat) / l;
                var lng = (this._center.lng * (l - 1) + marker.getPosition().lng) / l;
                this._center = new BMap.Point(lng, lat);
                this.updateGridBounds();
            }//计算新的Center
        }

        marker.isInCluster = true;
        this._markers.push(marker);

        var len = this._markers.length;
        if(len < this._minClusterSize ){
            this._map.addOverlay(marker);
            //this.updateClusterMarker();
            return true;
        } else if (len === this._minClusterSize) {
            for (var i = 0; i < len; i++) {
                this._markers[i].getMap() && this._map.removeOverlay(this._markers[i]);
            }

        }
        this._map.addOverlay(this._clusterMarker);
        this._isReal = true;
        this.updateClusterMarker();
        return true;
    };

    /**
     * 判断一个标记是否在该聚合中。
     * @param {Marker} marker 要判断的标记。
     * @return {Boolean} true或false。
     */
    Cluster.prototype.isMarkerInCluster= function(marker){
        if (this._markers.indexOf) {
            return this._markers.indexOf(marker) != -1;
        } else {
            for (var i = 0, m; m = this._markers[i]; i++) {
                if (m === marker) {
                    return true;
                }
            }
        }
        return false;
    };

    /**
     * 判断一个标记是否在该聚合网格范围中。
     * @param {Marker} marker 要判断的标记。
     * @return {Boolean} true或false。
     */
    Cluster.prototype.isMarkerInClusterBounds = function(marker) {
        return this._gridBounds.containsPoint(marker.getPosition());
    };

    Cluster.prototype.isReal = function(marker) {
        return this._isReal;
    };

    /**
     * 更新该聚合的网格范围。
     * @return 无返回值。
     */
    Cluster.prototype.updateGridBounds = function() {
        var bounds = new BMap.Bounds(this._center, this._center);
        this._gridBounds = getExtendedBounds(this._map, bounds, this._markerClusterer.getGridSize());
    };

    /**
     * 更新该聚合的显示样式，也即TextIconOverlay。
     * @return 无返回值。
     */
    Cluster.prototype.updateClusterMarker = function () {
        if (this._map.getZoom() > this._markerClusterer.getMaxZoom()) {
            this._clusterMarker && this._map.removeOverlay(this._clusterMarker);
            for (var i = 0, marker; marker = this._markers[i]; i++) {
                this._map.addOverlay(marker);
            }
            return;
        }

        if (this._markers.length < this._minClusterSize) {
            this._clusterMarker.hide();
            return;
        }

        this._clusterMarker.setPosition(this._center);

        this._clusterMarker.setText(this._markers.length);

        var thatMap = this._map;
        var thatBounds = this.getBounds();
        this._clusterMarker.addEventListener("click", function(event){
            thatMap.setViewport(thatBounds);
        });

    };

    /**
     * 删除该聚合。
     * @return 无返回值。
     */
    Cluster.prototype.remove = function(){
        for (var i = 0, m; m = this._markers[i]; i++) {
            this._markers[i].getMap() && this._map.removeOverlay(this._markers[i]);
        }//清除散的标记点
        this._map.removeOverlay(this._clusterMarker);
        this._markers.length = 0;
        delete this._markers;
    }

    /**
     * 获取该聚合所包含的所有标记的最小外接矩形的范围。
     * @return {BMap.Bounds} 计算出的范围。
     */
    Cluster.prototype.getBounds = function() {
        var bounds = new BMap.Bounds(this._center,this._center);
        for (var i = 0, marker; marker = this._markers[i]; i++) {
            bounds.extend(marker.getPosition());
        }
        return bounds;
    };

    /**
     * 获取该聚合的落脚点。
     * @return {BMap.Point} 该聚合的落脚点。
     */
    Cluster.prototype.getCenter = function() {
        return this._center;
    };

})();
(function () {
    HTMap.Oval = Class.create();
    HTMap.Oval.prototype = Object.extend(new Abstract.GraphOverLayer(), {
        center:null,
        aRadius:null,
        bRadius:null,
        initialize: function (points, optsOrRadius1,optsOrRadius2,opts3) {
            var opts = {};
            if(arguments.length<=2){
                /*注意此处的圆形坐标数组的结构为:[(minx,maxy),(maxx,miny)]*/
                this.points = points;
                opts = optsOrRadius1;
                this.center=this.buildExtent().getCenter();
                this.aRadius=Util.distanceByLnglat(this.points[0].x,this.center.y,this.points[1].x,this.center.y)/2;
                this.bRadius=Util.distanceByLnglat(this.center.x,this.points[0].y,this.center.x,this.points[1].y)/2;
            }
            else {
                opts = opts3;
                this.CenterAndRadius2Points(points,optsOrRadius1,optsOrRadius2);
            }
            Util.setOptionsValue(this, opts, {
                strokeColor: "#FF0000",
                fillColor: "#FF0000",
                fillOpacity: 0.5,
                strokeWeight: 1,
                strokeOpacity: 0.5,
                strokeStyle: '',
                enableMassClear: true,
                enableEditing: false,
                enableClicking: false
            });
            Util.setClassEvent(this);
        },
        CenterAndRadius2Points:function(c,r1,r2){
            var ks = Util.distanceOfLngLat(c.x, c.y);
            var dx = r1*ks.lng;
            var dy = r2*ks.lat;
            this.points = [new HTMap.CPoint(c.x-dx, c.y+dy),new HTMap.CPoint(c.x+dx, c.y-dy)];
            this.center = new HTMap.CPoint(c.x, c.y);
            this.aRadius = r1;
            this.bRadius = r2;
        },
        getCenter:function(){
            return this.center;
        },
        setCenter:function(point){
            var dx = point.x-this.center.x;
            var dy = point.y-this.center.y;
            if(dx!=0 || dy !=0){
                this.points[0].x+=dx;
                this.points[0].y+=dy;
                this.points[1].x+=dx;
                this.points[1].y+=dy;
                this.center.x=point.x;
                this.center.y=point.y;
                this.UpdateGeometry();
            }
        },
        getARadius:function(){return this.aRadius;},
        getBRadius:function(){return this.bRadius;},
        setARadius:function(r){
            this.CenterAndRadius2Points(this.center,r,this.bRadius);
            this.UpdateGeometry();
        },
        setBRadius:function(r){
            this.CenterAndRadius2Points(this.center,this.aRadius,r);
            this.UpdateGeometry();
        },
        CreateDiv:function(){
            if (!this.div) {
                this.id = Util.createUniqueID('Over_Polygon_');
                this.div = this.drawPaper.ellipse(0, 0, 0, 0);
            }
        },
        UpdateGeometry: function () {
            if (!this.div) return;
            var curZoom = this.model.getZoom();
            var pxPoints = [];
            for (var i = 0; i < this.points.length; i++) {
                var ePoint = Util.getScreenPixel(new HTMap.Coordinate(this.points[i].getCoord().x, this.points[i].getCoord().y), curZoom);
                pxPoints.push({ x: ePoint.x, y: ePoint.y });
            }
            var dx = (pxPoints[0].x - pxPoints[1].x) / 2;
            var dy = (pxPoints[0].y - pxPoints[1].y) / 2;
            var cx, cy, rx, ry;
            if (dx < 0) {
                cx = pxPoints[1].x + dx;
                rx = -dx;
            }
            else {
                cx = pxPoints[1].x + dx;
                rx = dx;
            }
            if (dy < 0) {
                cy = pxPoints[1].y + dy;
                ry = -dy;
            }
            else {
                cy = pxPoints[1].y + dy;
                ry = dy;
            }
            this.div.attr({
                cx: cx,
                rx: rx,
                cy: cy,
                ry: ry
            });
        }
    });
})();
(function () {
    HTMap.OverlayDiv = Class.create();
    HTMap.OverlayDiv.prototype = Object.extend(new Abstract.OverLayer(), {
        initialize: function (point, div, opts) {
            this.position = point;
            this.innerDiv = div;
            Util.setOptionsValue(this, opts, {
                offset: { x: 0, y: 0 }
            });
            this.id = Util.createUniqueID("Over_OverlayDiv_");
        },
        getDivPosition: function () {
            this.sPoint = Util.getScreenPixel(this.position.getCoord(), this.map.model.getZoom());
            var deltaX;
            var deltaY;
            deltaX = this.sPoint.x + this.offset.x;
            deltaY = this.sPoint.y + this.offset.y;
            return { x: deltaX, y: deltaY };
        },
        setToMap: function (map) {
            map = map || this.map;
            this.map = map;
            this.mapDiv = this.mapDiv || Prototype.$(map.mapControl.id);
            this.model = this.model || map.model;

            var xy = this.getDivPosition();
            var deltaX = xy.x;
            var deltaY = xy.y;

            if (!this.div) {
                //创建标注div
                this.div = Util.createDivByOpts({
                    id: this.id,
                    left: deltaX,
                    top: deltaY,
                    position: "absolute"
                });
                this.div.style.zIndex = 400;
                this.div.appendChild(this.innerDiv);
                this.mapDiv.appendChild(this.div)
            }
            else {
                this.div.style.top = deltaY + "px";
                this.div.style.left = deltaX + "px";
            }
        }
    });
})();

(function(){
    HTMap.Label = Class.create();
    HTMap.Label.prototype = Object.extend(new HTMap.OverlayDiv(), {
        initialize:function(content,opts){
            this.innerDiv = document.createElement("div");
            this.innerDiv.innerHTML = content;
            Util.setOptionsValue(this, opts, {
                offset: { x: 0, y: 0 },
                position: null,
                enableMassClear:true
            });
            this.id = Util.createUniqueID("Over_OverlayDivLabel_");
        },
        _UpdateLocation:function(){
            if(this.div){
                var xy = this.getDivPosition();
                this.div.style.top = xy.x + "px";
                this.div.style.left = xy.y + "px";
            }
        },
        setContent:function(content){
            this.innerDiv.innerHTML = content;
        },
        setPosition:function(point){
            this.position = point;
            this._UpdateLocation();
        },
        getPosition:function(){return this.position;},
        setOffset:function(offset){
            this.offset = offset;
            this._UpdateLocation();
        },
        getOffset:function(){return this.offset;},
        setZIndex:function(zIndex){if(this.div)this.div.style.zIndex = zIndex}
    });
})();
(function () {

    HTMap.Point = Class.create();
    HTMap.Point.prototype = {
        x:0,y:0,dx:0,dy:0,
        initialize: function (x, y) {
            if (typeof (x) == "string") {
                x = parseFloat(x);
            }
            if (typeof (y) == "string") {
                y = parseFloat(y);
            }

            this.dx=x;this.dy=y;
            HTMap.Transform.toCore(this);
        },
        getX:function(){
            return parseFloat(this.dx.toFixed(HTMap.mapConfig.CoordFixed));
        },
        setX:function(x){
            this.dx = x;
            HTMap.Transform.toCore(this);
        },
        getY:function(){
            return parseFloat(this.dy.toFixed(HTMap.mapConfig.CoordFixed));
        },
        setY:function(y){
            this.dy = y;
            HTMap.Transform.toCore(this);
        },

        getCoord: function () {
            return new HTMap.Coordinate(this.x * 1e16, this.y * 1e16);
        },

        calcuDistance: function (point) {
            return Util.distanceByLnglat(this.x, this.y, point.x, point.y);
        },

        toString: function () {
            return 'X:' + this.getX() + ',Y:' + this.getY();
        }
    }

    HTMap.CPoint = Class.create();
    HTMap.CPoint.prototype = {
        x:0,y:0,dx:0,dy:0,
        initialize: function (x, y) {
            if (typeof (x) == "string") {
                x = parseFloat(x);
            }
            if (typeof (y) == "string") {
                y = parseFloat(y);
            }
            this.x = x;this.y = y;
            HTMap.Transform.toDisplay(this);
        },
        getX:function(){
            return parseFloat(this.dx.toFixed(HTMap.mapConfig.CoordFixed));
        },
        setX:function(x){
            this.dx = x;
            HTMap.Transform.toCore(this);
        },
        getY:function(){
            return parseFloat(this.dy.toFixed(HTMap.mapConfig.CoordFixed));
        },
        setY:function(y){
            this.dy = y;
            HTMap.Transform.toCore(this);
        },

        getCoord: function () {
            return new HTMap.Coordinate(this.x * 1e16, this.y * 1e16);
        },

        calcuDistance: function (point) {
            return Util.distanceByLnglat(this.x, this.y, point.x, point.y);
        },

        toString: function () {
            return 'X:' + this.getX() + ',Y:' + this.getY();
        }
    }
})();
(function () {

    HTMap.Polygon = Class.create();
    HTMap.Polygon.prototype = Object.extend(new Abstract.GraphOverLayer(), {
        initialize: function (points, opts) {
            this.points = points;
            Util.setOptionsValue(this, opts, {
                strokeColor: "#FF0000",
                fillColor: "#FF0000",
                fillOpacity: 0.5,
                strokeWeight: 1,
                strokeOpacity: 0.5,
                strokeStyle: '',
                enableMassClear: true,
                enableEditing: false,
                enableClicking: false
            });
            Util.setClassEvent(this);
        },
        CreateDiv:function(){
            this.id = Util.createUniqueID('Over_Polygon_');
            var curZoom = this.model.getZoom();
            var pxPoints = [];
            for (var i = 0; i < this.points.length; i++) {
                var ePoint = Util.getScreenPixel(new HTMap.Coordinate(this.points[i].getCoord().x, this.points[i].getCoord().y), curZoom);
                pxPoints.push(ePoint.x + "," + ePoint.y);
            }
            var path = "M" + pxPoints.join("L");
            this.div = this.drawPaper.path(path);
            this._updateLabel();
        },
        UpdateGeometry: function () {
            if (!this.div) return;
            var curZoom = this.model.getZoom();
            var pxPoints = [];
            for (var i = 0; i < this.points.length; i++) {
                var ePoint = Util.getScreenPixel(new HTMap.Coordinate(this.points[i].getCoord().x, this.points[i].getCoord().y), curZoom);
                pxPoints.push(ePoint.x + "," + ePoint.y);
            }
            this.div.attr({"path": "M" + pxPoints.join("L") + "Z"});
            this._updateLabel();
        },
        containsPoint: function(point){
            return Util.IsPointInPolygon(point,this.points);
        },
        getArea:function(){
            return Util.calcArea(this.points);
        },
        _gravity:function(){
            var p = this.points;
            var area = 0;
            var center = {};
            center.x = 0;
            center.y = 0;
            var n = p.length;
            for (var i = 0; i < n-1; i++){
                area += (p[i].x*p[i+1].y - p[i+1].x*p[i].y)/2;
                center.x += (p[i].x*p[i+1].y - p[i+1].x*p[i].y) * (p[i].x + p[i+1].x);
                center.y += (p[i].x*p[i+1].y - p[i+1].x*p[i].y) * (p[i].y + p[i+1].y);
            }
            area += (p[n-1].x*p[0].y - p[0].x*p[n-1].y)/2;
            center.x += (p[n-1].x*p[0].y - p[0].x*p[n-1].y) * (p[n-1].x + p[0].x);
            center.y += (p[n-1].x*p[0].y - p[0].x*p[n-1].y) * (p[n-1].y + p[0].y);
            center.x /= 6*area;
            center.y /= 6*area;
            return new HTMap.CPoint(center.x,center.y);
        },
        _getTextCenter:function(){
            var g = this._gravity();
            if(this.containsPoint(g)){
                return g;
            }
            else{
                var cy = this._getXCrossCenterY(g.x);
                if(cy !== undefined){
                    return new HTMap.CPoint(g.x, cy);
                }
                return g;
            }
        },
        _getXCrossCenterY:function(x){
            var ys = [];
            for(var i = 0;i<this.points.length-1;i++){
                var p0 = this.points[i];
                var p1 = this.points[i+1];
                var min,max;
                min = p0.x<p1.x?(p0.x+(max = p1.x)-p1.x):(p1.x+(max = p0.x)-p0.x);
                if(x>=min && x<=max){
                    ys.push((p0.y-p1.y)/2+p1.y)
                }
            }
            if(ys.length){
                var min = Math.min.apply(Math,ys);
                var max = Math.max.apply(Math,ys);
                return (max-min)/2+min;
            }
        },
        setLabel:function(text,font,fontSize,fontColor){
            this._labelText = text;
            this._labelStyle = {};
            this._labelStyle.Font = font || "Arial";
            this._labelStyle.Size = fontSize || "12px";
            this._labelStyle.Color = fontColor || "#000";
            this._updateLabel();
        },
        _updateLabel:function(){
            if (!this.div) return;
            if(this.text){
                this.text.remove();
            }
            if(!this._labelText)return;
            var c = this._getTextCenter();
            var curZoom = this.model.getZoom();
            var px = Util.getScreenPixel(new HTMap.Coordinate(c.getCoord().x, c.getCoord().y), curZoom);
            var defOffsetX = this._labelText.length*6/2;
            this.text = this.drawPaper.text(px.x-defOffsetX,px.y,this._labelText);
            this.text.attr("fill",this._labelStyle.Color).attr("font",this._labelStyle.Size+' "'+this._labelStyle.Font+'"');
        }
    });
})();
(function () {
    HTMap.Polyline = Class.create();
    HTMap.Polyline.prototype = Object.extend(new Abstract.GraphOverLayer(), {
        _hasFill:false,
        initialize: function (points, opts) {
            this.points = points;
            Util.setOptionsValue(this, opts, {
                strokeColor: "#FF0000",
                fillColor: "#FF0000",
                fillOpacity: 0.5,
                strokeWeight: 2,
                strokeOpacity: 1,
                strokeStyle: '',
                enableMassClear: true,
                enableEditing: false,
                enableClicking: false
            });
            Util.setClassEvent(this);
        },
        CreateDiv:function(){
            if (!this.div) {
                this.id = Util.createUniqueID('Over_Polygon_');
                var curZoom = this.model.getZoom();
                var pxPoints = [];
                for (var i = 0; i < this.points.length; i++) {
                    var ePoint = Util.getScreenPixel(new HTMap.Coordinate(this.points[i].getCoord().x, this.points[i].getCoord().y), curZoom);
                    pxPoints.push(ePoint.x + "," + ePoint.y);
                }
                var path = "M" + pxPoints.join("L");
                this.div = this.drawPaper.path(path);
                this._updateLabel();
            }
        },
        UpdateGeometry: function () {
            if (!this.div) return;
            var curZoom = this.model.getZoom();
            var pxPoints = [];
            for (var i = 0; i < this.points.length; i++) {
                var ePoint = Util.getScreenPixel(new HTMap.Coordinate(this.points[i].getCoord().x, this.points[i].getCoord().y), curZoom);
                pxPoints.push(ePoint.x + "," + ePoint.y);
            }
            this.div.attr({"path":"M" + pxPoints.join("L")});
            this._updateLabel();
        },
        /**
         * 获取折线的总长度(米)
         * @return {Number}
         */
        getLength: function () {
            if (this.points.length <= 1) return 0;
            var len = 0;
            for (var i = 0; i < this.points.length - 1; i++) {
                len += this.points[i].calcuDistance(this.points[i + 1]);
            }
            return len;
        },
        _getTextCenter:function(){
            var len = 0,ds = [];
            function l(p,p2){return Math.sqrt((p.x-p2.x)*(p.x-p2.x)+(p.y-p2.y)*(p.y-p2.y))}
            for(var i = 0;i<this.points.length-1;i++){
                var p0 = this.points[i];
                var p1 = this.points[i+1];
                var d = l(p0,p1);
                ds.push(d);
                len += d;
            }
            var c = len / 2,len2= 0,ci=0;
            for(var i=0;i<ds.length;i++){
                var d = ds[i];
                len2+=d;
                if(len2>=c){
                    ci = i;
                    break;
                }
            }
            function gc(v1,v2){return (v1-v2)/2+v2}
            var cp0=this.points[ci],cp1=this.points[ci+1];
            return new HTMap.CPoint(gc(cp0.x,cp1.x),gc(cp0.y,cp1.y));
        },
        setLabel:function(text,font,fontSize,fontColor){
            this._labelText = text;
            this._labelStyle = {};
            this._labelStyle.Font = font || "Arial";
            this._labelStyle.Size = fontSize || "12px";
            this._labelStyle.Color = fontColor || "#000";
            this._updateLabel();
        },
        _updateLabel:function(){
            if (!this.div) return;
            if(this.text){
                this.text.remove();
            }
            if(!this._labelText)return;
            var c = this._getTextCenter();
            var curZoom = this.model.getZoom();
            var px = Util.getScreenPixel(new HTMap.Coordinate(c.getCoord().x, c.getCoord().y), curZoom);
            var defOffsetX = this._labelText.length*6/2;
            this.text = this.drawPaper.text(px.x-defOffsetX,px.y,this._labelText);
            this.text.attr("fill",this._labelStyle.Color).attr("font",this._labelStyle.Size+' "'+this._labelStyle.Font+'"');
        }
    });

    //多折线线段
    HTMap.MultiPolyline = Class.create();
    HTMap.MultiPolyline.prototype = Object.extend(new Abstract.OverLayer(), {

        initialize: function (plylinespoints, color, size) {
            this.plylinespoints = plylinespoints;
            this.color = color;
            this.size = size;
            this.bound = this.buildExtent();
        },

        buildExtent: function () {
            var minX = 180e16, maxX = 0, minY = 90e16, maxY = 0;

            for (var j = 0; j < this.plylinespoints.length; j++) {
                var points = this.plylinespoints[j];
                for (var i = 0; i < points.length; i++) {
                    if (points[i].getCoord().x < minX) minX = points[i].getCoord().x;
                    if (points[i].getCoord().x > maxX) maxX = points[i].getCoord().x;
                    if (points[i].getCoord().y < minY) minY = points[i].getCoord().y;
                    if (points[i].getCoord().y > maxY) maxY = points[i].getCoord().y;
                }
            }
            return new HTMap.Bound(minX, maxX, minY, maxY);
        },

        getExtent: function () {
            return this.bound;
        },

        setExtent: function (extent) {
            this.bound = extent;
        },

        getCenterCoord: function () {
            return this.getExtent().getCenterCoord();
        },

        getLength: function () {
            if (this.plylinespoints.length <= 1) return 0;
            var len = 0;
            for (var j = 0; j < this.plylinespoints.length; j++) {
                var points = this.plylinespoints[j];
                for (var i = 0; i < points.length - 1; i++) {
                    len += points[i].calcuDistance(points[i + 1]);
                }
            }
            return len;
        },

        setToMap: function (mapDiv, model, overLayerDiv) {
            this.mapDiv = mapDiv;
            this.model = model;
            var curZoom = model.getZoom();
            var pixel = Util.getScreenPixel(new HTMap.Coordinate(this.getExtent().getMinX(), this.getExtent().getMaxY()), curZoom); //经纬度转屏幕

            var mlines = [];
            for (var j = 0; j < this.plylinespoints.length; j++) {
                var points = this.plylinespoints[j];
                var lines = new Array();
                lines.push('<v:PolyLine filled="false" Points="');
                for (var i = 0; i < points.length; i++) {
                    var sPoint = Util.getScreenPixel(new HTMap.Coordinate(points[i].getCoord().x, points[i].getCoord().y), curZoom);
                    lines.push(Math.floor(sPoint.x) + ',' + Math.floor(sPoint.y) + ',');
                }
                lines[lines.length - 1] = lines[lines.length - 1].substring(0, lines[lines.length - 1].length - 1);
                lines.push('" style="position:relative" strokecolor="' + this.color + '" strokeweight="' + this.size + '"/>');
                mlines.push(lines.join(""));
            }
            if (overLayerDiv) {
                overLayerDiv.innerHTML = "";
                overLayerDiv.style.left = pixel.x
                overLayerDiv.style.top = pixel.y
                overLayerDiv.innerHTML = mlines.join("");
            }
            else {
                this.id = Util.createUniqueID('Over_Polyline_');
                this.div = Util.createDiv(this.id, pixel.x, pixel.y, null, null, null, 'absolute');
                this.div.style.zIndex = 10;
                this.div.innerHTML = mlines.join("");
                this.insert()
            }

        }
    });
})();
(function () {
    HTMap.Rect = Class.create();
    HTMap.Rect.prototype = Object.extend(new Abstract.GraphOverLayer(), {
        initialize: function (points, opts) {
            this.points = points;
            Util.setOptionsValue(this, opts, {
                strokeColor: "#FF0000",
                fillColor: "#FF0000",
                fillOpacity: 0.5,
                strokeWeight: 1,
                strokeOpacity: 0.5,
                strokeStyle: '',
                enableMassClear: true,
                enableEditing: false,
                enableClicking: false
            });
            Util.setClassEvent(this);
        },
        CreateDiv:function(){
            if (!this.div) {
                this.id = Util.createUniqueID('Over_Polygon_');
                this.div = this.drawPaper.path("M{x1},{y1}L{x2},{y1}L{x2},{y2}L{x1},{y2}L{x1},{y1}".format(
                    {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 0
                    }));
                this._updateLabel();
            }
        },
        UpdateGeometry: function () {
            if (!this.div) return;
            var curZoom = this.model.getZoom();
            var pxPoints = [];
            for (var i = 0; i < this.points.length; i++) {
                var ePoint = Util.getScreenPixel(new HTMap.Coordinate(this.points[i].getCoord().x, this.points[i].getCoord().y), curZoom);
                pxPoints.push({ x: ePoint.x, y: ePoint.y });
            }
            this.div.attr({
                path: "M{x1},{y1}L{x2},{y1}L{x2},{y2}L{x1},{y2}L{x1},{y1}".format(
                    {
                        x1: pxPoints[0].x,
                        y1: pxPoints[0].y,
                        x2: pxPoints[1].x,
                        y2: pxPoints[1].y
                    })
            });
            this._updateLabel();
        },
        //如果点的地理坐标位于此矩形内，则返回true。
        containsPoint: function(point){
            return this.getBounds().containsPoint(point);
        },
        getArea:function(){
            var b=this.getBounds();
            return Util.calcArea([
                {x: b.getMinX()/1e16,y: b.getMinY()/1e16},
                {x: b.getMinX()/1e16,y: b.getMaxY()/1e16},
                {x: b.getMaxX()/1e16,y: b.getMaxY()/1e16},
                {x: b.getMaxX()/1e16,y: b.getMinY()/1e16}
            ]);
        },
        _getTextCenter:function(){
            function gc(v1,v2){return (v1-v2)/2+v2}
            return new HTMap.CPoint(gc(this.points[0].x,this.points[1].x),gc(this.points[0].y,this.points[1].y));
        },
        setLabel:function(text,font,fontSize,fontColor){
            this._labelText = text;
            this._labelStyle = {};
            this._labelStyle.Font = font || "Arial";
            this._labelStyle.Size = fontSize || "12px";
            this._labelStyle.Color = fontColor || "#000";
            this._updateLabel();
        },
        _updateLabel:function(){
            if (!this.div) return;
            if(this.text){
                this.text.remove();
            }
            if(!this._labelText)return;
            var c = this._getTextCenter();
            var curZoom = this.model.getZoom();
            var px = Util.getScreenPixel(new HTMap.Coordinate(c.getCoord().x, c.getCoord().y), curZoom);
            var defOffsetX = this._labelText.length*6/2;
            this.text = this.drawPaper.text(px.x-defOffsetX,px.y,this._labelText);
            this.text.attr("fill",this._labelStyle.Color).attr("font",this._labelStyle.Size+' "'+this._labelStyle.Font+'"');
        }
    });
})();
(function () {
    HTMap.Rectangle = Class.create();
    HTMap.Rectangle.prototype = {
        initialize: function (minX, maxX, minY, maxY) {
            this.minX = minX;
            this.maxX = maxX;
            this.minY = minY;
            this.maxY = maxY;
            this.bound = new HTMap.Bound(minX * 1e16, maxX * 1e16, minY * 1e16, maxY * 1e16);
        },

        getPixelWidth: function (zoom) {
            //return Math.abs(this.maxX - this.minX);

            var topleft = Util.getScreenPixel((new HTMap.CPoint(this.minX, this.maxY)).getCoord(), zoom).x;
            var bottomright = Util.getScreenPixel((new HTMap.CPoint(this.maxX, this.minY)).getCoord(), zoom).x;
            return Math.floor(Math.abs(bottomright - topleft));
        },

        getPixelHeight: function (zoom) {
            //return Math.abs(this.maxY - this.minY);

            var topleft = Util.getScreenPixel((new HTMap.CPoint(this.minX, this.maxY)).getCoord(), zoom).y;
            var bottomright = Util.getScreenPixel((new HTMap.CPoint(this.maxX, this.minY)).getCoord(), zoom).y;
            return Math.floor(Math.abs(topleft - bottomright));
        },

        getBound: function () {
            return this.bound;
        },

        getCenter: function () {
            return this.bound.getCenterCoord();
        }
    }
})();
(function () {
    HTMap.MapModel = Class.create();
    HTMap.MapModel.prototype = {
        OvContainer: null,
        controls: new Object(),
        ovId: null,
        defaultCenterPoint: null,
        DefaultLevel: null,
        overlays: null,
        traceIndex: 0,
        traces: new Object(),
        curIndex: -1,
        mapTypeIds: new Array(),

        initialize: function (id) {
            this.modelId = id;
            this.mapTypes = new Object();
            Util.setClassEvent(this);
        },

        getZoom: function () {
            return this.zoom;
        },

        setZoom: function (zoom) {
            this.zoom = zoom;
        },

        setViewCenterCoord: function (centerCoord,sender) {
            this.viewCenterCoord = centerCoord;
            this.triggerEvent("centerChange", { sender: sender || this, center: centerCoord.getPoint() });
        },

        getViewCenterCoord: function () {
            return this.viewCenterCoord;
        },

        getViewBound: function () {
            return this.viewBound;
        },

        setViewBound: function (bound) {
            this.viewBound = bound;
        },

        setCurrentMapType: function (type) {
            this.currentMapType = type;
        },


        getCurrentMapType: function () {
            return this.currentMapType;
        },

        getId: function () {
            return this.modelId;
        },

        getOvContainer: function () {
            return this.OvContainer;
        },

        getOvMapDiv: function () {
            return this.OvContainer.childNodes[0];
        },

        setOvContainer: function (ovContainer, id) {
            this.OvContainer = ovContainer;
            this.ovId = id;
        },

        getOvModel: function (ovLevel) {
            var newModel = new HTMap.MapModel(Util.createUniqueID());
            newModel.setViewCenterCoord(this.getViewCenterCoord());
//            ovLevel = ovLevel==undefined?HTMap.mapConfig.MinZoomLevel:ovLevel;//this.getZoom().getLevel() - 2;
//            ovLevel = ovLevel<HTMap.mapConfig.MinZoomLevel?HTMap.mapConfig.MinZoomLevel:ovLevel;
            var zoom = new HTMap.Zoom(ovLevel);
            newModel.setZoom(zoom);
            newModel.setCurrentMapType(this.getCurrentMapType());
            newModel.setViewBound(zoom.getViewBoundByCenter(this.OvContainer, this.getViewCenterCoord()));
            return newModel;
        },

        reset: function (mapDiv) {
            this.setViewCenterCoord(this.defaultCenterPoint.getCoord());
            this.setZoom(new HTMap.Zoom(this.DefaultLevel));
            this.controls[mapDiv.id].paint(this, true);
        },

        clearOverLayers: function (mapDiv) {
            if (this.overlays) {
                for (var i = 0; i < this.overlays.length; i++) {
                    if (!this.overlays[i].disableMassClear) this.overlays[i].remove();
                }
                this.overlays.clear();
            }
        }

    };


})();
(function () {
    //Map Data source(abstract classs)
    HTMap.MapType = function () { };
    HTMap.MapType.prototype = {
        initialize: function (dirSrc, opts) {
            opts = opts || {};
            this.enableImg = opts.enableImg || "";//当前地图类型为本类型的时候，地图类型控件显示的图标url
            this.disableImg = opts.enableImg || "";//当前地图类型不为本类型的时候，地图类型控件显示的图标url
            this.typeId = 'mapType_' + Util.createUniqueID();
            if (typeof (dirSrc) == "function") {
                this.getSrc = dirSrc || this.getSrc;//自定义瓦片获取函数
            }
            else {
                this.dirSrc = dirSrc; //瓦片地图的主目录
            }
        },

        SrcFuncs: [
            function (level, row, column, maptype) {
                var src = maptype.dirSrc + 'zoom_' + level + '/0/' + level + '_' + row + '_' + column + '.png';
                return src;
            }
        ],
        getSrc: function (level, row, column) {
            var src = [];
            for (var i = 0; i < this.SrcFuncs.length; i++) {
                src.push(this.SrcFuncs[i](level, row, column, this));
            }
            return src.join('|');
        },

        paint: function (model, container) {
            this.model = model;
            this.container = container;
            var ids = new Array();
            var html = '';
            for (var i = 0; i < model.mapTypeIds.length; i++) {
                var mapType = model.mapTypes[model.mapTypeIds[i]];
                if (mapType.enableImg && mapType.disableImg) {
                    if (model.currentMapType.typeId == mapType.typeId) {
                        html += '<img src="' + mapType.enableImg + '" style="cursor:pointer;float: left;margin-left: 5px"> ';
                    }
                    else {
                        html += '<img id="Img_' + mapType.typeId + '" src="' + mapType.disableImg + '" style="cursor:pointer;float: left;margin-left: 5px"> ';
                        ids.push("Img_" + mapType.typeId);
                    }
                }
            }
            if (this.model.typeBarId) {
                this.typeBarDiv = Prototype.$(this.model.typeBarId);
            }
            else {
                var right = Util.getValueOfNoPX(container.style.left) + 20;
                var top = Util.getValueOfNoPX(container.style.top) + 50;
                this.model.typeBarId = Util.createUniqueID("typeBar_");
                this.typeBarDiv = Util.createDiv(this.model.typeBarId, null, 27, null, null, null, 'absolute');
                this.typeBarDiv.style.right = '45px';
            }
            this.typeBarDiv.innerHTML = html;
            container.appendChild(this.typeBarDiv);
            for (var i = 0; i < ids.length; i++) {
                this.curId = ids[i];
                Event.observe(Prototype.$(ids[i]), 'click', this.mapTypeSwitch.bindAsEventListener(this));
            }

        },

        mapTypeSwitch: function (e) {
            var id = this.curId.substring(4, this.curId.length);
            mapType = this.model.mapTypes[id];
            this.model.setCurrentMapType(mapType);
            this.ClearOrgMapType(this.container.childNodes[0])
            this.model.controls[this.container.childNodes[0].id].paint(this.model, true);
            if (this.model.controls[this.model.ovId]) this.model.controls[this.model.ovId].paint(this.model);
            mapType.paint(this.model, this.container);
        },

        ClearOrgMapType: function (container) {
            var mapDiv = container;
            var tileNodes = mapDiv.childNodes;
            if (tileNodes) {
                for (var i = 0; i < tileNodes.length; i++) {
                    if (tileNodes[i].id.indexOf('_zoom_') > 0) {
                        mapDiv.removeChild(tileNodes[i]);
                        i--;
                    }
                }
            }
        }
    };

    HTMap.HTMapType = Class.create();
    HTMap.HTMapType.prototype = Object.extend(new HTMap.MapType(), {
        SrcFuncs: [function (level, row, column, maptype) {
            var src = maptype.dirSrc + 'zoom_' + level + '/' + level + '_' + row + '_' + column + '.png';
            return src;
        }]
    });

    HTMap.HTGoogleMapType = Class.create();
    HTMap.HTGoogleMapType.prototype = Object.extend(new HTMap.MapType(), {
        SrcFuncs: [function (level, row, column, maptype) {
            var src = maptype.dirSrc + column + '&y=' + row + '&zoom=' + (18 - level);
            return src;
        }]
    });

    HTMap.HTGoogleMapType2 = Class.create();
    HTMap.HTGoogleMapType2.prototype = Object.extend(new HTMap.MapType(), {
        SrcFuncs: [function (level, row, column, maptype) {
            var src = maptype.dirSrc + column + '&y=' + row + '&z=' + (level - 1) + '&s=';
            return src;
        }]
    });
    HTMap.HTMixMapType = Class.create();
    HTMap.HTMixMapType.prototype = Object.extend(new HTMap.MapType(), {
        SrcFuncs: [],
        getSrc: function (level, row, column) {
            var src = [];
            for (var i = 0; i < this.SrcFuncs.length; i++) {
                src.push(this.SrcFuncs[i](level, row, column, this));
            }
            return src.join('|');
        }
    });
})();
(function(){
    Abstract.OverLayer = Class.create();
    Abstract.OverLayer.prototype = {
        initialize: function () {
            this.enableMassClear = true;
            this.isRaphaelObject = true;
            this.Events = {};
            this._pauseEvents = {};
        },

        addEventListener : function (eventName, handler) {
            if (!this.Events) return;
            if (!this.Events["Event_" + eventName]) {
                this.Events["Event_" + eventName] = [];
            }
            this.Events["Event_" + eventName].push(handler);
        },
        triggerEvent : function (eventName, args) {
            if (!this.Events) return true;
            var events = this.Events["Event_" + eventName]
            if (events) {
                if (this._pauseEvents[eventName] && this._pauseEvents[eventName] > 0) {
                    this._pauseEvents[eventName]--;
                    return true;
                }
                for (var i = 0; i < events.length; i++) {
                    /*事件处理函数可以通过返回false来终止事件的执行并将此值返回给触发事件的代码*/
                    if (events[i](args) == false) return false;
                }
            }
            return true;//返回true表示没有事件处理函数或者所有的事件处理函数完成了处理
        },
        removeEventListener : function (eventName, handler) {
            if (!this.Events) return;
            var e = this.Events["Event_" + eventName];
            if (e) {
                for (var i = 0; i < e.length; i++) {
                    if (e[i] == handler) {
                        e.splice(i, 1);
                        return;
                    }
                }
            }
        },
        pauseEvent : function (eventName) {
            this._pauseEvents[eventName] = 1;
        },

        insert: function (map) {
            this.map = map;
            this.mapDiv = this.mapDiv || Prototype.$(map.mapControl.id);
            this.model = this.model || map.model;

            if (this.model == null)
                return;
            if (this.model.overlays == null)
                this.model.overlays = new Array();
            this.model.overlays.push(this);
            this.drawPaper = map.mapControl.drawPaper;
            this.setToMap(map);
            Event.observe(this.div, "click", function (e) {
                Event.stop(e);
            });
            this.triggerEvent("insert", { sender: this });
        },

        remove: function () {
            if (this.removed) return;
            if (this.model == null)
                return;
            if (this.model.overlays) {
                this.model.overlays = this.model.overlays.without(this)
                if (this.div.remove) {
                    this.div.remove();
                }
                else {
                    this.mapDiv.removeChild(this.div);
                }
                this.removed = true;
            }
            this.triggerEvent("remove", { sender: this });
        },

        hide: function () {
            this.div.style.display = "none";
        },

        show: function () {
            this.div.style.display = "";
        },

        /**
         * 是否在调用map.clearOverlays清除此覆盖物，默认为true。
         * @param {Boolean} disable
         */
        disableMassClear: function (disable) {
            this.enableMassClear = !disable;
        },

        /**
         * 设置覆盖物的zIndex
         * @param {Number} index
         */
        setZIndex: function (index) {
            if (this.div) {
                this.div.style.zIndex = index;
            }
        },

        /**
         * 获取覆盖物所在的map对象
         */
        getMap: function () {
            return this.map;
        }
    };
})();

(function(){
    Abstract.GraphOverLayer = Class.create();
    Abstract.GraphOverLayer.prototype = {
        initialize:function(){
            this.enableMassClear = true;
            this.isRaphaelObject = true;
            this.Events = {};
            this._pauseEvents = {};
            this._hasFill = true;
        },
        addEventListener : function (eventName, handler) {
            if (!this.Events) return;
            if (!this.Events["Event_" + eventName]) {
                this.Events["Event_" + eventName] = [];
            }
            this.Events["Event_" + eventName].push(handler);
        },
        triggerEvent : function (eventName, args) {
            if (!this.Events) return true;
            var events = this.Events["Event_" + eventName]
            if (events) {
                if (this._pauseEvents[eventName] && this._pauseEvents[eventName] > 0) {
                    this._pauseEvents[eventName]--;
                    return true;
                }
                for (var i = 0; i < events.length; i++) {
                    /*事件处理函数可以通过返回false来终止事件的执行并将此值返回给触发事件的代码*/
                    if (events[i](args) == false) return false;
                }
            }
            return true;//返回true表示没有事件处理函数或者所有的事件处理函数完成了处理
        },
        removeEventListener : function (eventName, handler) {
            if (!this.Events) return;
            var e = this.Events["Event_" + eventName];
            if (e) {
                for (var i = 0; i < e.length; i++) {
                    if (e[i] == handler) {
                        e.splice(i, 1);
                        return;
                    }
                }
            }
        },
        pauseEvent : function (eventName) {
            this._pauseEvents[eventName] = 1;
        },

        insert: function (map) {
            this.map = map;
            this.mapDiv = this.mapDiv || Prototype.$(map.mapControl.id);
            this.model = this.model || map.model;

            if (this.model == null)
                return;
            if (this.model.overlays == null)
                this.model.overlays = new Array();
            this.model.overlays.push(this);
            this.drawPaper = map.mapControl.drawPaper;
            this.setToMap(map);
            Event.observe(this.div, "click", function (e) {
                Event.stop(e);
            });
            this.triggerEvent("insert", { sender: this });
        },

        remove: function () {
            if (this.removed) return;
            if (this.model == null)
                return;
            if (this.model.overlays) {
                this.model.overlays = this.model.overlays.without(this)
                if (this.div.remove) {
                    this.div.remove();
                }
                else {
                    this.mapDiv.removeChild(this.div);
                }
                this.removed = true;
            }
            this.triggerEvent("remove", { sender: this });
        },

        /**
         * 是否在调用map.clearOverlays清除此覆盖物，默认为true。
         * @param {Boolean} disable
         */
        disableMassClear: function (disable) {
            this.enableMassClear = !disable;
        },

        /**
         * 设置覆盖物的zIndex
         * @param {Number} index
         */
        setZIndex: function (index) {
            if (this.div) {
                this.div.style.zIndex = index;
            }
        },

        /**
         * 获取覆盖物所在的map对象
         */
        getMap: function () {
            return this.map;
        },
        hide:function(){
            this.div.hide();
        },
        show:function(){
            this.div.show();
        },
        setToMap:function(map){
            this.map = map;
            if (!this.div) {
                this.CreateDiv();
                this.initEvent();
            }
            this.UpdateGeometry();
            this.UpdateSymbol();
        },
        buildExtent: function () {
            var minX = 180e16, maxX = 0, minY = 90e16, maxY = 0;

            for (var i = 0; i < this.points.length; i++) {
                if (this.points[i].getCoord().x < minX) minX = this.points[i].getCoord().x;
                if (this.points[i].getCoord().x > maxX) maxX = this.points[i].getCoord().x;
                if (this.points[i].getCoord().y < minY) minY = this.points[i].getCoord().y;
                if (this.points[i].getCoord().y > maxY) maxY = this.points[i].getCoord().y;
            }
            return this.bound = new HTMap.Bound(minX, maxX, minY, maxY);
        },
        getExtent: function () {
            return this.buildExtent();
        },
        initEvent:function(){
            if(!this.enableClicking)return;
            var me=this;
            this.div.click(function(e){
                me.triggerEvent("click", { sender: me, e: e });
            });
            this.div.mouseover(function(e){
                me.triggerEvent("mouseover", { sender: me, e: e });
            });
            this.div.mouseout(function(e){
                me.triggerEvent("mouseout", { sender: me, e: e });
            });
            this.div.touchstart(function(e){
                me.triggerEvent("touchstart", { sender: me, e: e });
                me.triggerEvent("click", { sender: me, e: e });
            });
        },
        CreateDiv:function(){},
        UpdateGeometry:function(){},
        UpdateSymbol:function(){
            if(this.div){
                var style = {
                    "stroke": this.strokeColor,
                    "stroke-width": this.strokeWeight,
                    "stroke-opacity": this.strokeOpacity,
                    "stroke-dasharray": this.strokeStyle,
                    "cursor":this.enableClicking?"pointer":""
                };
                if(this._hasFill){
                    style["fill"] = this.fillColor;
                    style["fill-opacity"] = this.fillOpacity;
                }
                this.div.attr(style);
            }
        },
        /**
         * 修改指定位置的坐标。索引index从0开始计数。
         * @param index
         * @param point
         */
        setPositionAt: function (index, point) {
            this.points[index] = point;
            this.UpdateGeometry();
        },
        /**
         * 设置图形的点数组
         * @param points
         */
        setPath: function (points) {
            this.points = points;
            this.UpdateGeometry();
        },
        /**
         * 返回图形的点数组
         * @return {*}
         */
        getPath: function () {
            return this.points;
        },
        /**
         * 设置图形的边线颜色，参数为合法的CSS颜色值。
         * @param color
         */
        setStrokeColor: function (color) {
            this.strokeColor = color;
            if (this.div) {
                this.div.attr("stroke", this.strokeColor);
            }
        },
        /**
         * 返回图形的边线颜色。
         * @return {*}
         */
        getStrokeColor: function () {
            return this.strokeColor;
        },
        /**
         * 设置图形的填充颜色，参数为合法的CSS颜色值。
         * @param color
         */
        setFillColor: function (color) {
            if(!this._hasFill)throw "Not supported";
            this.fillColor = color;
            if (this.div) {
                this.div.attr("fill", this.fillColor);
            }
        },
        /**
         * 返回图形的填充颜色。
         * @return {*}
         */
        getFillcolor: function () {
            return this.fillColor;
        },
        /**
         * 设置图形的边线透明度，取值范围0 - 1。
         * @param opacity
         */
        setStrokeOpacity: function (opacity) {
            this.strokeOpacity = opacity;
            if (this.div) {
                this.div.attr("stroke-opacity", this.strokeOpacity);
            }
        },
        /**
         * 返回图形的边线透明度。
         * @return {*}
         */
        getStrokeOpacity: function () {
            return this.strokeOpacity;
        },
        /**
         * 设置图形的填充透明度，取值范围0 - 1。
         * @param opacity
         */
        setFillOpacity: function (opacity) {
            if(!this._hasFill)throw "Not supported";
            this.fillOpacity = opacity;
            if (this.div) {
                this.div.attr("fill-opacity", this.fillOpacity);
            }
        },
        /**
         * 返回图形的填充透明度。
         * @return {*}
         */
        getFillOpacity: function () {
            return this.fillOpacity;
        },
        /**
         * 设置图形边线的宽度，取值为大于等于1的整数。
         * @param weight
         */
        setStrokeWeight: function (weight) {
            this.strokeWeight = weight;
            if (this.div) {
                this.div.attr("stroke-width", this.strokeWeight);
            }
        },
        /**
         * 返回图形边线的宽度。
         * @return {*}
         */
        getStrokeWeight: function () {
            return this.strokeWeight;
        },
        /**
         * 设置图形边线样式
         * @param style
         */
        setStrokeStyle: function (style) {
            this.strokeStyle = style;
            if (this.div) {
                this.div.attr("stroke-dasharray", this.strokeStyle);
            }
        },
        /**
         * 返回图形边线样式。
         * @return {*}
         */
        getStrokeStyle: function () {
            return this.strokeStyle;
        },
        /**
         * 返回覆盖物的地理区域范围。
         * @return {*}
         */
        getBounds: function () {
            return this.buildExtent();
        }
    };
})();

(function () {
    HTMap.Tile = Class.create();
    HTMap.Tile.prototype = {
        initialize: function (row, column, level, model) {
            this.row = row;
            this.column = column;
            this.level = level;
            this.model = model;
        },

        getRow: function () {
            return this.row;
        },

        getColumn: function () {
            return this.column;
        },

        getLevel: function () {
            return this.level;
        },

        getMapModel: function () {
            return this.model;
        },

        getSrc: function () {
            return this.model.getCurrentMapType().getSrc(this.level, this.row, this.column);
        }
    }
})();
(function () {

    HTMap.Zoom = Class.create();
    HTMap.Zoom.prototype = {
        HMaxLength: 0,//1342176/2,//(理论最大值可取1342176/2但是受到绘图库IE的限制，实验最大值约为5万)//坑爹....
        initialize: function (level) {
            this.level = level;
            this.tileCols = HTMap.mapConfig.FirstZoomTileCols * Math.pow(2, (this.level));//最低等级0
            this.tileRows = HTMap.mapConfig.FirstZoomTileRows * Math.pow(2, (this.level));
            this.realMapBound = HTMap.mapConfig.FullExtent;
        },

        getViewBoundByCenter: function (container, center) {
            var width = Util.getValueOfNoPX(container.clientWidth + 'px') / 2;
            var height = Util.getValueOfNoPX(container.clientHeight + 'px') / 2;
            var px = Util.getScreenPixel(center, this);
            var px1 = { x: px.x - width, y: px.y - height };
            var px2 = { x: px.x + width, y: px.y + height };
            var c1 = Util.getCoordinateByPixel(px1, this);
            var c2 = Util.getCoordinateByPixel(px2, this);
            var b = new HTMap.Bound(c1.x, c2.x, c2.y, c1.y);
            b.px = px1;
            b.px2 = px2;
            b.centerCoord = center;
            this.viewBound = b;
            return b;
        },

        getLevel: function () {
            return this.level;
        },

        getTileCols: function () {
            return this.tileCols;
        },

        getTileRows: function () {
            return this.tileRows;
        },

        getScale: function (latitude) {
            return Util.getGroundResolution(this, latitude);//每像素距离(米)
        },

        getTiles: function (model, container) {
            var coord = model.getViewCenterCoord();
            var viewBound = this.getViewBoundByCenter(container, coord);
            if (!this.realMapBound.isCover(viewBound))return [];

            var tiles = new Array();

            var t1 = Util.getTileXYByPixel(viewBound.px);
            var t2 = Util.getTileXYByPixel(viewBound.px2);

            var rowFrom = t1.y
            rowFrom = rowFrom < 0 ? 0 : rowFrom;

            var rowTo = t2.y;
            rowTo = rowTo > this.tileRows ? this.tileRows : rowTo;

            var colFrom = t1.x
            colFrom = colFrom < 0 ? 0 : colFrom;

            var colTo = t2.x;
            colTo = colTo > this.tileCols ? this.tileCols : colTo;

            //预加载外层几格的瓦片
            var delta = 2;
            rowFrom = rowFrom - delta < 0 ? 0 : rowFrom - delta;
            rowTo = rowTo + delta > this.tileRows ? this.tileRows : rowTo + delta;
            colFrom = colFrom - delta < 0 ? 0 : colFrom - delta;
            colTo = colTo + delta > this.tileCols ? this.tileCols : colTo + delta;

            for (var i = rowFrom; i < rowTo; i++) {
                for (var j = colFrom; j < colTo; j++) {
                    var tile = new HTMap.Tile(i, j, this.level, model);
                    tiles.push(tile);
                }
            }
            return tiles;
        },

        getOffsetByCenter: function (container, center, mapDivW, mapDivH) {
            var cpx = Util.getScreenPixelEx(center, this);
            //偏移一半，防止画板无法覆盖到地图区域
            var width = mapDivW / 2;
            var height = mapDivH / 2;
            return { x: cpx.x - width, y: cpx.y - height };
        }
    }
})();
(function () {
    HTMap.googleProjection = {
        Clip: function (n, minValue, maxValue) {
            return Math.min(Math.max(n, minValue), maxValue);
        },
        GetTileMatrixSizePixel: function (zoom) {
            var s = this.GetTileMatrixSizeXY(zoom);
            return { Width: s.Width * HTMap.mapConfig.TileSize, Height: s.Height * HTMap.mapConfig.TileSize };
        },
        GetTileMatrixSizeXY: function (zoom) {
            var sMin = this.GetTileMatrixMinXY(zoom);
            var sMax = this.GetTileMatrixMaxXY(zoom);

            return { Width: sMax.Width - sMin.Width + 1, Height: sMax.Height - sMin.Height + 1 };
        },
        GetTileMatrixMaxXY: function (zoom) {
            var xy = (1 << zoom);
            return { Width: xy - 1, Height: xy - 1 };
        },
        GetTileMatrixMinXY: function (zoom) {
            return { Width: 0, Height: 0 };
        },
        MinLatitude: -85.05112878,
        MaxLatitude: 85.05112878,
        MinLongitude: -180,
        MaxLongitude: 180,
        Axis: 6378137,
        FromLatLngToPixel: function (x, y, zoom) {
            var ret = {};
            var lat = y / 1e16;
            var lng = x / 1e16;
            lat = this.Clip(lat, this.MinLatitude, this.MaxLatitude);
            lng = this.Clip(lng, this.MinLongitude, this.MaxLongitude);

            var x = (lng + 180) / 360;
            var sinLatitude = Math.sin(lat * Math.PI / 180);
            var y = 0.5 - Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (4 * Math.PI);

            var s = this.GetTileMatrixSizePixel(zoom.getLevel());
            var mapSizeX = s.Width;
            var mapSizeY = s.Height;

            ret.x = Math.floor(this.Clip(x * mapSizeX + 0.5, 0, mapSizeX - 1));
            ret.y = Math.floor(this.Clip(y * mapSizeY + 0.5, 0, mapSizeY - 1));

            return ret;
        },
        FromPixelToLatLng: function (x, y, zoom) {
            var s = this.GetTileMatrixSizePixel(zoom.getLevel());
            var mapSizeX = s.Width;
            var mapSizeY = s.Height;

            var xx = (this.Clip(x, 0, mapSizeX - 1) / mapSizeX) - 0.5;
            var yy = 0.5 - (this.Clip(y, 0, mapSizeY - 1) / mapSizeY);

            var y = 90 - 360 * Math.atan(Math.exp(-yy * 2 * Math.PI)) / Math.PI;
            var x = 360 * xx;

            return new HTMap.Coordinate(x * 1e16, y * 1e16);
        },
        getGroundResolution: function (zoomobj, latitude) {
            var zoom = zoomobj.getLevel();
            return (Math.cos(latitude * (Math.PI / 180)) * 2 * Math.PI * this.Axis) / this.GetTileMatrixSizePixel(zoom).Width;
        }
    };
})();
(function () {
    HTMap.rectangularProjection = {
        FromLatLngToPixel: function (x, y, zoom) {
            var sx = (x - zoom.realMapBound.getMinX()) * ((zoom.getTileCols() * HTMap.mapConfig.TileSize) / zoom.realMapBound.getWidth());
            var sy = (zoom.realMapBound.getMaxY() - y) * ((zoom.getTileRows() * HTMap.mapConfig.TileSize) / zoom.realMapBound.getHeight());
            return { x: sx, y: sy }
        },
        FromPixelToLatLng: function (x, y, zoom) {
            var x = zoom.realMapBound.getMinX() + x * (zoom.realMapBound.getWidth() / (zoom.getTileCols() * HTMap.mapConfig.TileSize));
            var y = zoom.realMapBound.getMaxY() - y * (zoom.realMapBound.getHeight() / (zoom.getTileRows() * HTMap.mapConfig.TileSize));
            return new HTMap.Coordinate(x, y);
        },
        getGroundResolution: function (zoom, lat) {
            return Util.distanceByLnglat(zoom.realMapBound.getMinX() / 1e16, zoom.realMapBound.getMaxY() / 1e16, zoom.realMapBound.getMaxX() / 1e16, zoom.realMapBound.getMaxY() / 1e16) / zoom.tileCols / HTMap.mapConfig.TileSize;
        }
    };
})();
(function () {
    Abstract.Tool = function () { }
    Abstract.Tool.prototype = {
        initialize: function (id, opts) {
            this.toolType = "Tool";
            this.id = id;
            Util.setClassEvent(this);
            Util.setOptionsValue(this, opts, {});
        },
        OnSelect: function () { },
        ClearSelect: function () { },
        mouseDownHandler: function (e, toolManager) { Event.stop(e); },
        mouseUpHandler: function (e, toolManager) { Event.stop(e); },
        mouseMoveHandler: function (e, toolManager) { },
        clickHandler: function (e, toolManager) { Event.stop(e); },
        dblClickHandler: function (e, toolManager) { Event.stop(e); },

        touchstart:function(e){},
        touchend:function(e){},
        touchmove:function(e){},
        touchcancel:function(e){}
    };
})();
(function () {
    HTMap.ToolManager = Class.create();
    HTMap.ToolManager.prototype = {
        initialize: function (map, tools) {
            this.map = map;
            this.tools = {};
            tools = tools || [];
            this.defaultTool = null;
            this.currentTool = null;
            var mapDiv = map.mapControl.mapDiv;
            this.mapDiv = mapDiv;
            this.model = map.model;
            for (var i = 0; i < tools.length; i++) this.addTool(tools[i]);
            var mouseEvents=[
                {event:"mousedown",handler:"mouseDownHandler"},
                {event:"mousemove",handler:"mouseMoveHandler"},
                {event:"mouseup",handler:"mouseUpHandler"},
                {event:"dblclick",handler:"dblClickHandler"},
                {event:"click",handler:"clickHandler"}
            ];
            var mobileEvents=["touchstart","touchend","touchmove","touchcancel"];
            var useEvents = Util.isMobile?mobileEvents:mouseEvents;
            var getHandler=function(handler){
                return function(e){
                    if (this.currentTool == null || this.tools[this.currentTool.id].toolType == "Command")
                        return;
                    this.tools[this.currentTool.id][handler](e, this);
                }
            }
            for(var i=0;i<useEvents.length;i++){
                var t = useEvents[i];
                var e = t.event || t;
                var h = t.handler || t;
                this[e]=getHandler(h);
                Event.observe(mapDiv, e, this[e].bindAsEventListener(this));
            }
            Util.setClassEvent(this);
        },
        setDefaultTool: function (dtool) {
            var tool = typeof (dtool) == "string" ? this.tools[dtool] : dtool;
            if (!this.tools[tool.id]) this.addTool(tool);
            this.defaultTool = tool;
        },
        switchTool: function (toTool) {
            if(toTool==null && this.defaultTool && this.currentTool!=this.defaultTool){
                this.currentTool && this.currentTool.ClearSelect() && this.triggerEvent("clearSelectTool", this.currentTool);
                this.defaultTool.OnSelect();
                this.triggerEvent("selectTool", this.defaultTool);
                this.currentTool = this.defaultTool;
                return;
            }
            var tool = typeof (toTool) == "string" ? this.tools[toTool] : toTool;
            if (this.currentTool != tool) {
                if (this.currentTool) {
                    this.currentTool.ClearSelect();
                    this.triggerEvent("clearSelectTool", this.currentTool);
                }
                if (tool) {
                    tool.OnSelect();
                    this.triggerEvent("selectTool", tool);
                }
            }
            this.currentTool = tool;
        },
        addTool: function (tool) {
            this.tools[tool.id] = tool;
            tool.map = this.map;
            tool.toolManager = this;
            tool.mapDiv = this.mapDiv;
            tool.drawPaper = this.map.mapControl.drawPaper;
            var me = this;
            tool.addEventListener("addOverlay", function (eventArgs) {
                me.triggerEvent("toolAddOverlay", eventArgs);
            });
        },
        removeTool: function (toolid) {
            if (this.tools[toolid] == this.currentTool) {
                if (this.tools[toolid] == this.defaultTool) {
                    this.switchTool(null);
                }
                else {
                    this.switchTool(this.defaultTool);
                }
            }
            this.tools[toolid] = null;
        },
        bindToolBar: function (toolbarid, opts) {
            var me = this;
            opts = opts || {};
            Util.setOptionsValue(opts, opts, {
                onSelectTool: function (tooldiv) {
                    tooldiv.style.backgroundColor = "#AAA";
                },
                onClearSelectTool: function (tooldiv) {
                    tooldiv.style.backgroundColor = "#FFF";
                }
            });
            var bl = function (div, func) {
                func(div);
                if (div.childNodes.length > 0) {
                    for (var i = 0; i < div.childNodes.length; i++) {
                        bl(div.childNodes[i], func);
                    }
                }
            };

            me.addEventListener("clearSelectTool", function (tool) {
                bl(Prototype.$(toolbarid), function (div) {
                    if (div.getAttribute && div.getAttribute("mapToolId") == tool.id) {
                        opts.onClearSelectTool(div);
                    }
                });
            });

            me.addEventListener("selectTool", function (tool) {
                bl(Prototype.$(toolbarid), function (div) {
                    if (div.getAttribute && div.getAttribute("mapToolId") == tool.id) {
                        opts.onSelectTool(div);
                    }
                });
            });

            bl(Prototype.$(toolbarid), function (div) {
                if (div.getAttribute && div.getAttribute("mapToolId")) {
                    var tool = me.tools[div.getAttribute("mapToolId")];
                    if (!tool) return;
                    Event.observe(div, "click", function (e) {
                        me.switchTool(tool);
                    });
                    div.style.cursor = "pointer";
                    if (tool.alt) div.setAttribute("title", tool.alt);
                }
            });
        }
    }
})();
(function () {
    //标点
    HTMap.AddMarkerTool = Class.create();
    HTMap.AddMarkerTool.prototype = Object.extend(new Abstract.Tool(), {
        markerOpts : {},
        setMarkerOptions:function(markerOpts){
            Util.setOptionsValue(this.markerOpts, markerOpts, {});
        },
        mouseUpHandler: function (e, toolbar) {
            //取得鼠标位置
            var mouseDownPixel = Util.getMouseRelativePixel(e, this.mapDiv);
            var coord = Util.getCoordinateByPixel(mouseDownPixel, toolbar.model.getZoom());
            var mp = new HTMap.CPoint(coord.x / 1e16, coord.y / 1e16);
            //将标注添加到地图上
            var tempMarker = new HTMap.Marker(mp, this.markerOpts);
            this.map.addOverLayer(tempMarker);
            Event.stop(e);
            var me =this;
            setTimeout(function(){
                me.triggerEvent("addOverlay", { sender: me, overlay: tempMarker });
            },100);
        },
        ClearSelect: function () {
            Util.removeClass(this.mapDiv, "AddMarker-Cursor");
        },
        OnSelect: function () {
            Util.addClass(this.mapDiv, "AddMarker-Cursor");
        }
    });
})();
(function () {
    //画箭头
    HTMap.ArrowsTool = Class.create();
    HTMap.ArrowsTool.prototype = Object.extend(new Abstract.Tool(), {

        AddControlPoint: function (bindp) {
            var div = Util.createDiv(Util.createUniqueID('CPDiv_'));
            div.className = "Arrows-CPdiv";
            if (this[bindp]) {
                div.style.left = this[bindp].x + 'px';
                div.style.top = this[bindp].y + 'px';
            }
            div.style.zIndex = 400;
            div.style.cursor = "move";
            var me = this;
            Util.setElementDrag(div, {
                dragging: function (e, x, y) {
                    me[bindp] = { x: x, y: y };
                    me.UpdateCPoint();
                }
            });
            this.mapDiv.appendChild(div);
            this.ControlPoint = this.ControlPoint || [];
            this.ControlPoint.push(div);
        },

        MakerPath: function (sp1, sp2, cp, ep) {
            //从结束点开始算起，计算箭头形状的几个点坐标
            var a = 25, b = 330;
            var d = 50, md = 20;
            //锐角点
            var p1 = DrawBaseUtil.aLPoint(ep, cp, d, -a);
            var p2 = DrawBaseUtil.aLPoint(ep, cp, d, a);
            //曲线结束点
            var qp1 = DrawBaseUtil.aLPoint(p1, ep, md, b);
            var qp2 = DrawBaseUtil.aLPoint(p2, ep, md, -b);
            var path = "M{起点1}C{控制点},{控制点},{曲线结束点1}L{锐角点1},{终点},{锐角点2},{曲线结束点2}C{控制点},{控制点},{起点2}".format({
                "起点1": DrawBaseUtil.pToStr(sp1),
                "控制点": DrawBaseUtil.pToStr(cp),
                "曲线结束点1": DrawBaseUtil.pToStr(qp1),
                "锐角点1": DrawBaseUtil.pToStr(p1),
                "终点": DrawBaseUtil.pToStr(ep),
                "锐角点2": DrawBaseUtil.pToStr(p2),
                "曲线结束点2": DrawBaseUtil.pToStr(qp2),
                "起点2": DrawBaseUtil.pToStr(sp2)
            });
            return path;
        },

        mouseDownHandler: function (e, toolbar) {
            if (this.Sate == null) {
                this.Div = Util.createDiv(Util.createUniqueID('ArrowsDiv'));
                this.mapDiv = toolbar.mapDiv;
                this.mapDiv.appendChild(this.Div);
                this.StartPoint = Util.getMouseRelativePixel(e, this.mapDiv);
                this.StartPoint2 = Util.getMouseRelativePixel(e, this.mapDiv);
                this.Sate = "S"
            }
            else if (this.Sate == "S") {
                this.EndPoint = Util.getMouseRelativePixel(e, this.mapDiv);
                this.CPoint = { x: (this.StartPoint.x + this.EndPoint.x) / 2, y: (this.StartPoint.y + this.EndPoint.y) / 2 };

                this.AddControlPoint("CPoint");
                this.AddControlPoint("StartPoint");
                this.AddControlPoint("EndPoint");
                this.AddControlPoint("StartPoint2");

                this.UpdateCPoint();
                this.Sate = "E";
            }
        },

        UpdateCPoint: function () {
            var s = this.MakerPath(this.StartPoint, this.StartPoint2, this.CPoint, this.EndPoint);
            //计算渐变角度
            var a = Math.floor(DrawBaseUtil.getAngle(this.StartPoint, this.StartPoint2) + 90);
            if (this.path) {
                this.path.attr("path", s);
                this.path.attr("fill", "{0}-#FF0000-#FF0000".format(a));
            }
            else {
                this.path = this.drawPaper.path(s).attr(
                    {
                        "stroke-width": "1",
                        "stroke": "#FF0000",
                        "fill-opacity": 0//线性渐变的透明度渐变即为1-fill-opacity的渐变
                    }
                );
            }
        },

        mouseUpHandler: function (e, toolbar) { },

        mouseMoveHandler: function (e, toolbar) {
            if (this.Sate == "S") {
                this.EndPoint = Util.getMouseRelativePixel(e, this.mapDiv);
                this.CPoint = { x: (this.StartPoint.x + this.EndPoint.x) / 2, y: (this.StartPoint.y + this.EndPoint.y) / 2 };
                this.UpdateCPoint();
            }
        },

        dblClickHandler: function (e, toolbar) {
            if (this.Sate == "E") {
                var sp = Util.getCoordinateByPixel(this.StartPoint, toolbar.model.getZoom()).getPoint();
                var sp2 = Util.getCoordinateByPixel(this.StartPoint2, toolbar.model.getZoom()).getPoint();
                var ep = Util.getCoordinateByPixel(this.EndPoint, toolbar.model.getZoom()).getPoint();
                var cp = Util.getCoordinateByPixel(this.CPoint, toolbar.model.getZoom()).getPoint();
                var arr = new HTMap.Arrows(sp, sp2, ep, cp);
                this.map.addOverLayer(arr);
                this.ClearSelect();
                Event.stop(e);
                this.triggerEvent("addOverlay", { sender: this, overlay: arr });
            }
        },

        clickHandler: function (e, model) {
            Event.stop(e);
        },

        ClearSelect: function () {
            this.Sate = null;
            if (this.ControlPoint) {
                for (var i = 0; i < this.ControlPoint.length; i++) {
                    this.mapDiv.removeChild(this.ControlPoint[i]);
                    this.ControlPoint[i] = null;
                }
            }
            this.ControlPoint = [];
            if (this.path) {
                this.path.remove();
            }
            this.path = null;
            Util.removeClass(this.mapDiv, "Line-Cursor");
        },

        OnSelect: function () {
            Util.addClass(this.mapDiv, "Line-Cursor");
        }
    });
})();
(function () {
    //画线
    HTMap.LineTool = Class.create();
    HTMap.LineTool.prototype = Object.extend(new Abstract.Tool(), {
        isDrag: false,
        measure: new Array(),

        mouseDownHandler: function (e, toolbar) {
            var mpx = Util.getMouseRelativePixel(e, this.mapDiv);
            this.mouseDownPixel = { x: Math.floor(mpx.x), y: Math.floor(mpx.y) };
            var coord = Util.getCoordinateByPixel(this.mouseDownPixel, toolbar.model.getZoom());
            this.measure.push(new HTMap.CPoint(coord.x / 1e16, coord.y / 1e16));
            if (!this.isDrag) this.isDrag = true;
            this.lastX = this.mouseDownPixel.x;
            this.lastY = this.mouseDownPixel.y;
            if (!this.vLine) {
                this.vLine = this.drawPaper.path("M{0},{1}L{0},{1}".format(Math.floor(this.mouseDownPixel.x), Math.floor(this.mouseDownPixel.y)));
                this.vLine.attr("stroke-width", "2");
                this.vLine.attr("stroke", "#FF0000");
            }
            else {
                var path = this.vLine.attr("path").toString() + "L{0},{1}".format(Math.floor(this.mouseDownPixel.x), Math.floor(this.mouseDownPixel.y));//增加一个点
                this.vLine.attr("path", path);
            }

            Event.stop(e);
        },

        mouseMoveHandler: function (e, toolbar) {
            if (!this.isDrag)
                return;
            this.mouseMovePixel = Util.getMouseRelativePixel(e, this.mapDiv);
            var path = this.vLine.attr("path");
            var a = path.toString().split("L");
            a[a.length - 1] = "{0},{1}".format(Math.floor(this.mouseMovePixel.x), Math.floor(this.mouseMovePixel.y));//修改最后一个点的位置
            this.vLine.attr("path", a.join("L"));
            Event.stop(e);
        },

        dblClickHandler: function (e, toolbar) {
            if (!this.isDrag || !this.vLine) return;
            this.vLine.remove();
            this.vLine = null;
            var pline = new HTMap.Polyline(this.measure);
            this.map.addOverLayer(pline);
            this.measure = new Array();
            this.isDrag = false;
            Event.stop(e);
            this.triggerEvent("addOverlay", { sender: this, overlay: pline });
        },

        clickHandler: function (e, model) {
            Event.stop(e);
        },

        mouseUpHandler: function (e, model) {
            Event.stop(e);
        },

        ClearSelect: function () {
            if (this.vLine) this.vLine.remove();
            this.isDrag = false;
            Util.removeClass(this.mapDiv, "Line-Cursor");
        },

        OnSelect: function () {
            Util.addClass(this.mapDiv, "Line-Cursor");
        }
    });
})();
(function () {
    //测面
    HTMap.MeasureAreaTool = Class.create();
    HTMap.MeasureAreaTool.prototype = Object.extend(new Abstract.Tool(), {
        isDrag: false,
        alt: '测面积',
        measure: new Array(),
        isyet: false,
        mouseDownHandler: function (e, toolbar) {
            if (this.isyet) return;
            if (!this.lineDiv) {
                this.lineDiv = Util.createDiv('lineDiv');
                this.mapDiv.appendChild(this.lineDiv);
            }
            this.mouseDownPixel = Util.getMouseRelativePixel(e, this.mapDiv);

            if (!this.isDrag)
                this.isDrag = true;
            this.lastX = this.mouseDownPixel.x;
            this.lastY = this.mouseDownPixel.y;

            var coord = Util.getCoordinateByPixel(this.mouseDownPixel, toolbar.model.getZoom());
            this.measure.push(new HTMap.CPoint(coord.x / 1e16, coord.y / 1e16));
            if (!this.isDrag) this.isDrag = true;
            this.lastX = this.mouseDownPixel.x;
            this.lastY = this.mouseDownPixel.y;
            if (!this.vLine) {
                this.vLine = this.drawPaper.path("M{0},{1}L{0},{1}".format(Math.floor(this.mouseDownPixel.x), Math.floor(this.mouseDownPixel.y))).attr(
                    {
                        "stroke-width": "1",
                        "stroke": "#FF0000",
                        "fill": "#FF0000",
                        "fill-opacity": 0.5
                    }
                );
            }
            else {
                var path = this.vLine.attr("path").toString() + "L{0},{1}".format(Math.floor(this.mouseDownPixel.x), Math.floor(this.mouseDownPixel.y));//增加一个点
                this.vLine.attr("path", path);
            }
            var len = Util.calcArea(this.measure);
            var unit = '';
            if(len>1000000){
                unit = "平方千米";
                len = (len/1000000).toFixed(2);
            }
            else{
                unit = "平方米";
                len = (len).toFixed(2);
            }
            if(!this.LastLenstrdiv){
                var lendiv = document.createElement("div");
                lendiv.className = "Measure-Result";
                this.LastLenstrdiv = lendiv;
            }
            this.LastLenstrdiv.style.left = this.mouseDownPixel.x + 'px';
            this.LastLenstrdiv.style.top = this.mouseDownPixel.y + 'px';
            this.LastLenstrdiv.innerText = len + unit;

            var lenjddiv = document.createElement('div');
            lenjddiv.className = "Measure-jd";
            lenjddiv.style.left = this.mouseDownPixel.x + 'px';
            lenjddiv.style.top = this.mouseDownPixel.y + 'px';
            //lenjddiv.style.zIndex=201;//高于绘图层的index,会导致在谷歌浏览器下无法接受双击事件
            this.lineDiv.appendChild(lenjddiv);

            Event.stop(e);
        },

        mouseMoveHandler: function (e, toolbar) {
            if (!this.isDrag)
                return;
            this.mouseMovePixel = Util.getMouseRelativePixel(e, this.mapDiv);
            var path = this.vLine.attr("path");
            var a = path.toString().split("L");
            a[a.length - 1] = "{0},{1}".format(this.mouseMovePixel.x, this.mouseMovePixel.y);//修改最后一个点的位置
            this.vLine.attr("path", a.join("L"));
            Event.stop(e);
        },

        clearResult:function(){
            this.lineDiv && this.lineDiv.parentNode.removeChild(this.lineDiv);
            this.LastLenstrdiv = null;
            this.lineDiv = null;
            if(this.vLine){this.vLine.remove();this.vLine=null;}
            this.isyet = false;
            this.measure = [];
        },

        dblClickHandler: function (e, toolbar) {
            if (!this.isDrag || !this.lineDiv)
                return;
            var clslink = document.createElement("span");
            clslink.setAttribute("class", "Measure-ClearResult");
            clslink.innerHTML = '<a>清除结果</a>';
            this.measure = new Array();
            this.isDrag = false;
            var me = this;
            this.isyet = true;
            clslink.onclick = function () {
                me.clearResult();
            };
            this.LastLenstrdiv.style.zIndex = 201;
            this.LastLenstrdiv.appendChild(clslink);
            this.lineDiv.appendChild(this.LastLenstrdiv);
            Event.stop(e);
        },

        clickHandler: function (e, model) {
            Event.stop(e);
        },

        mouseUpHandler: function (e, model) {
            Event.stop(e);
        },

        ClearSelect: function () {
            Util.removeClass(this.mapDiv, "MeasureArea-Cursor");
            if (this.mapDiv && this.lineDiv) {
                try {
                    this.clearResult();
                }
                catch (e) { }
            }
            this.isyet = false;
        },

        OnSelect: function () {
            Util.addClass(this.mapDiv, "MeasureArea-Cursor");
        }
    });
})();
(function () {
    //测距
    HTMap.MeasureTool = Class.create();
    HTMap.MeasureTool.prototype = Object.extend(new Abstract.Tool(), {
        isDrag: false,
        alt: '测距',
        measure: new Array(),
        isyet: false,
        mouseDownHandler: function (e, toolbar) {
            if (this.isyet) return;
            if (!this.lineDiv) {
                this.lineDiv = Util.createDiv('lineDiv');
                this.mapDiv.appendChild(this.lineDiv);
            }
            this.mouseDownPixel = Util.getMouseRelativePixel(e, this.mapDiv);

            if (!this.isDrag)
                this.isDrag = true;
            this.lastX = this.mouseDownPixel.x;
            this.lastY = this.mouseDownPixel.y;

            this.vLine = this.drawPaper.path("M{0},{1}L{0},{1}".format(this.mouseDownPixel.x, this.mouseDownPixel.y));
            this.Lines = this.Lines || [];
            this.Lines.push(this.vLine);
            this.vLine.attr("stroke-width", "2");
            this.vLine.attr("stroke", "#FF0000");

            var coord = Util.getCoordinateByPixel(this.mouseDownPixel, toolbar.model.getZoom());
            this.measure.push(new HTMap.CPoint(coord.x / 1e16, coord.y / 1e16));

            var pline = new HTMap.Polyline(this.measure, "blue", 2);
            var len = pline.getLength();
            var unit = '';
            if (len != null && len.toString().indexOf(".")) {
                var i = len.toString().indexOf(".");
                if (i < 4) {
                    unit = "米"
                    len = Number(len.toString().substring(0, i + 3));
                }
                else {
                    len = len / 1000;
                    i = len.toString().indexOf(".");
                    len = Number(len.toString().substring(0, i + 4));
                    unit = "千米";
                }
            }
            var lendiv = document.createElement("div");
            lendiv.className = "Measure-Result";
            lendiv.style.left = this.mouseDownPixel.x + 'px';
            lendiv.style.top = this.mouseDownPixel.y + 'px';
            lendiv.innerText = len + unit;
            this.lineDiv.appendChild(lendiv);
            this.LastLenstrdiv = lendiv;

            var lenjddiv = document.createElement('div');
            lenjddiv.className = "Measure-jd";
            lenjddiv.style.left = this.mouseDownPixel.x + 'px';
            lenjddiv.style.top = this.mouseDownPixel.y + 'px';
            //lenjddiv.style.zIndex=201;//高于绘图层的index,会导致在谷歌浏览器下无法接受双击事件
            this.lineDiv.appendChild(lenjddiv);

            Event.stop(e);
        },

        mouseMoveHandler: function (e, toolbar) {
            if (!this.isDrag)
                return;
            this.mouseMovePixel = Util.getMouseRelativePixel(e, this.mapDiv);
            var path = this.vLine.attr("path");
            var a = path.toString().split("L");
            a[a.length - 1] = "{0},{1}".format(this.mouseMovePixel.x, this.mouseMovePixel.y);//修改最后一个点的位置
            this.vLine.attr("path", a.join("L"));
            Event.stop(e);
        },

        clearResult:function(){
            this.lineDiv.parentNode.removeChild(this.lineDiv);
            this.lineDiv = null;
            if (this.Lines) {
                for (var i = 0; i < this.Lines.length; i++) {
                    this.Lines[i].remove();
                }
                this.Lines = null;
            }
            this.isyet = false;
        },

        dblClickHandler: function (e, toolbar) {
            if (!this.isDrag || !this.lineDiv)
                return;
            var clslink = document.createElement("span");
            clslink.setAttribute("class", "Measure-ClearResult");
            clslink.innerHTML = '<a>清除结果</a>';
            this.measure = new Array();
            this.isDrag = false;
            var me = this;
            this.isyet = true;
            clslink.onclick = function () {
                me.clearResult();
            };
            this.LastLenstrdiv.style.zIndex = 201;
            this.LastLenstrdiv.appendChild(clslink);
            Event.stop(e);
        },

        clickHandler: function (e, model) {
            Event.stop(e);
        },

        mouseUpHandler: function (e, model) {
            Event.stop(e);
        },

        ClearSelect: function () {
            Util.removeClass(this.mapDiv, "Measure-Cursor");
            if (this.mapDiv && this.lineDiv) {
                try {
                    this.clearResult();
                }
                catch (e) { }
            }
            this.isyet = false;
        },

        OnSelect: function () {
            Util.addClass(this.mapDiv, "Measure-Cursor");
        }
    });
})();
(function () {
    //画圆
    HTMap.OvalTool = Class.create();
    HTMap.OvalTool.prototype = Object.extend(new Abstract.Tool(), {
        isDrag: false,
        measure: new Array(),
        initialize: function (id, opts) {
            this.toolType = "Tool";
            this.id = id;
            Util.setClassEvent(this);
            Util.setOptionsValue(this, opts, {
                drawCircle:true
            });
        },

        mouseDownHandler: function (e, toolbar) {
            this.mouseDownPixel = Util.getMouseRelativePixel(e, this.mapDiv);
            var coord = Util.getCoordinateByPixel(this.mouseDownPixel, toolbar.model.getZoom());
            this.measure.push(new HTMap.CPoint(coord.x / 1e16, coord.y / 1e16));
            if (!this.isDrag)
                this.isDrag = true;
            this.lastX = this.mouseDownPixel.x;   //椭圆的左上角坐标
            this.lastY = this.mouseDownPixel.y;
            this.oval = this.drawPaper.ellipse(
                Math.floor(this.mouseDownPixel.x),
                Math.floor(this.mouseDownPixel.x), 0, 0)
                .attr({
                    "fill": "#FF0000",
                    "fill-opacity": 0.5
                });//绘制一个椭圆
            Event.stop(e);
        },

        mouseMoveHandler: function (e, toolbar) {
            if (!this.isDrag)
                return;
            this.mouseMovePixel = Util.getMouseRelativePixel(e, this.mapDiv);
            var dx = (this.mouseMovePixel.x - this.lastX) / 2;
            var dy = (this.mouseMovePixel.y - this.lastY) / 2;
            if (window.event.shiftKey || this.drawCircle) {
                var max = Math.max(Math.abs(dx), Math.abs(dy));
                dx = dx * max > 0 ? max : -max;
                dy = dy * max > 0 ? max : -max;
            }
            var cx, cy, rx, ry;
            if (dx < 0) {
                cx = this.lastX + dx;
                rx = -dx;
            }
            else {
                cx = this.lastX + dx;
                rx = dx;
            }
            if (dy < 0) {
                cy = this.lastY + dy;
                ry = -dy;
            }
            else {
                cy = this.lastY + dy;
                ry = dy;
            }
            this.oval.attr({
                cx: cx,
                rx: rx,
                cy: cy,
                ry: ry
            });
            Event.stop(e);
        },

        mouseUpHandler: function (e, toolbar) {
            this.mouseUpPixel = Util.getMouseRelativePixel(e, this.mapDiv);
            if (window.event.shiftKey || this.drawCircle) {
                var dx = this.mouseUpPixel.x - this.lastX;
                var dy = this.mouseUpPixel.y - this.lastY;
                var max = Math.max(Math.abs(dx), Math.abs(dy));
                dx = dx * max > 0 ? max : -max;
                dy = dy * max > 0 ? max : -max;
                this.mouseUpPixel.x = dx + this.lastX;
                this.mouseUpPixel.y = dy + this.lastY;
            }
            var coord = Util.getCoordinateByPixel(this.mouseUpPixel, toolbar.model.getZoom());
            this.measure.push(new HTMap.CPoint(coord.x / 1e16, coord.y / 1e16));
            var x1 = this.measure[0].x, x2 = this.measure[1].x;
            var y1 = this.measure[0].y, y2 = this.measure[1].y;
            var nmeasure = [new HTMap.CPoint(Math.min(x1, x2), Math.max(y1, y2)), new HTMap.CPoint(Math.max(x1, x2), Math.min(y1, y2))];

            var nOval;
            if(this.drawCircle){
                nOval = new HTMap.Circle(nmeasure);
            }
            else{
                nOval = new HTMap.Oval(nmeasure);
            }
            this.map.addOverLayer(nOval);

            this.measure = new Array();
            this.isDrag = false;
            this.oval.remove();
            this.oval = null;
            Event.stop(e);
            this.triggerEvent("addOverlay", { sender: this, overlay: nOval });
        },

        dblClickHandler: function (e, movel) {
            Event.stop(e);
        },

        clickHandler: function (e, model) {
            Event.stop(e);
        },

        ClearSelect: function () {
            if (this.oval) this.oval.remove();
            this.isDrag = false;
            Util.removeClass(this.mapDiv, "Oval-Cursor");
        },

        OnSelect: function () {
            Util.addClass(this.mapDiv, "Oval-Cursor");
        }
    });
})();
(function () {
    //漫游
    HTMap.PanTool = Class.create();
    HTMap.PanTool.prototype = Object.extend(new Abstract.Tool(), {
        selected: false,
        alt: '漫游',
        CanMove: true,
        _oDeltaX:0,_oDeltaY:0,
        InertialDragObject: {
            t0: null,
            currentVx: 0,
            currentVy: 0,
            currentV: 0
        },
        _lastMousePixel:null,

        mouseDownHandler: function (e, toolbar) {
            if (!this.map.enableDrag) return;
            Util.removeClass(this.mapDiv, "Pan-Cursor-open");
            Util.addClass(this.mapDiv, "Pan-Cursor-close");
            document.body.setAttribute('onselectstart', 'return false');
            if (this.runingInertialManager) {
                this.runingInertialManager.stop();
            }

            this.mapDiv = toolbar.mapDiv;
            if (!this.mapDiv)
                return;
            if (!this.isDrag)
                this.isDrag = true;
            this.orgPixelX = Util.getValueOfNoPX(this.mapDiv.style.left);
            this.orgPixelY = Util.getValueOfNoPX(this.mapDiv.style.top);
            this._oDeltaX = this._oDeltaY = 0;
            this.orgMousePixel = Util.getMousePixel(e);
            if (this.mapDiv.setCapture)
                this.mapDiv.setCapture();
            else if (window.captureEvents)
                window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP);
            document.onselectstart = function () { return false };
            this._lastMousePixel=this.orgMousePixel;
            Event.stop(e);
        },

        mouseMoveHandler: function (e, toolbar) {
            if (!this.map.enableDrag) return;
            if (this.orgMousePixel == null || this.isDrag == false || !this.mapDiv)return;
            this.newMousePixel = Util.getMousePixel(e);
            var deltaX = this._oDeltaX+ this.newMousePixel.x - this._lastMousePixel.x;
            var deltaY = this._oDeltaY+ this.newMousePixel.y - this._lastMousePixel.y;
            var isOut = Util.isMovedMapBoundOut(this.map,deltaX,deltaY);
            if((deltaX>0 && !isOut.leftOut) || (deltaX<0 && !isOut.rightOut)){
                this.mapDiv.style.left = (this.orgPixelX + deltaX) + "px";
                this._oDeltaX = deltaX;
            }
            if((deltaY>0 && !isOut.topOut) || (deltaY<0 && !isOut.bottomOut)){
                this.mapDiv.style.top = (this.orgPixelY + deltaY) + "px";
                this._oDeltaY = deltaY;
            }
            if (this.InertialDragObject.t0) {
                //当前瞬时速度
                var t = (new Date()).getTime() - this.InertialDragObject.t0.time.getTime();
                if (t != 0) {
                    this.InertialDragObject.currentVx = (this.newMousePixel.x - this.InertialDragObject.t0.px.x) / t * 1000;
                    this.InertialDragObject.currentVy = (this.newMousePixel.y - this.InertialDragObject.t0.px.y) / t * 1000;
                    //合速
                    this.InertialDragObject.currentV = Math.sqrt(this.InertialDragObject.currentVx * this.InertialDragObject.currentVx +
                        this.InertialDragObject.currentVy * this.InertialDragObject.currentVy);
                    //限速(控制滑动过程不超过2秒)
                    var maxV = 2 * 300 * 9.8
                    if (this.InertialDragObject.currentV > maxV) {
                        var k = maxV / this.InertialDragObject.currentV;
                        this.InertialDragObject.currentV = maxV;
                        this.InertialDragObject.currentVx *= k;
                        this.InertialDragObject.currentVy *= k;
                    }
                }
            }
            this.InertialDragObject.t0 = { time: new Date(), px: this.newMousePixel };
            this._lastMousePixel = this.newMousePixel;
            Event.stop(e);
        },

        mouseUpHandler: function (e, toolbar) {
            if (!this.map.enableDrag) return;
            if (!this.isDrag) return;
            if (!this.mapDiv)
                return;
            Util.removeClass(this.mapDiv, "Pan-Cursor-close");
            Util.addClass(this.mapDiv, "Pan-Cursor-open");
            document.body.setAttribute('onselectstart', '');
            if (this.mapDiv.releaseCapture)
                this.mapDiv.releaseCapture();
            else if (window.captureEvents)
                window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP);
            if (this.map._enableInertialDragging) {
                this.InertialDrag(function () {
                    this.map.mapControl.rPaintWithDivChanged(this.map.model);
                });
            }
            else {
                this.reLoadTiles(toolbar.model,this._oDeltaX,this._oDeltaY,this.mapDiv);
            }
            this.isDrag = false;
            Event.stop(e);
        },

        reLoadTiles: function (model,dx,dy, mapDiv) {
            var orgCenterCoord = model.getViewCenterCoord();
            var curZoom = model.getZoom();
            var oc = Util.getScreenPixel(orgCenterCoord, curZoom);
            oc.x -= dx;
            oc.y -= dy;
            var newCenterCoord = Util.getCoordinateByPixel(oc, curZoom);
            if (!newCenterCoord.isSame(orgCenterCoord))
                model.setViewCenterCoord(newCenterCoord);
            this.map.mapControl.loadTiles(model, mapDiv.parentNode, mapDiv, true);
        },

        clickHandler: function (e, toolbar) {
            Event.stop(e);
        },

        dblClickHandler: function (e, toolbar) {
            if (!this.map.dblClickZoom) return;
            //重新设置地图中心
            var currentPoint = Util.getCoordinateByPixel2(Util.getMousePixel(e), toolbar.model.zoom, toolbar.map).getPoint();
            toolbar.map.setCenter(currentPoint, toolbar.model.getZoom().getLevel() + 1);
            Event.stop(e);
        },

        _touchDeltaX:0,
        _touchDeltaY:0,
        _touchOrgDis:0,
        _touchZoomDis:120,
        _touchCenter:null,
        getTouchDis:function(e){
            var t1 = e.targetTouches.item(0);
            var t2 = e.targetTouches.item(1);
            var dx =t1.pageX-t2.pageX,dy=t1.pageY-t2.pageY;
            return dx*dx+dy*dy;
        },
        touchstart:function(event,toolbar){
            if(event.targetTouches.length==1){
                var e = event.targetTouches.item(0);
                if (!this.map.enableDrag) return;
                Util.removeClass(this.mapDiv, "Pan-Cursor-open");
                Util.addClass(this.mapDiv, "Pan-Cursor-close");
                document.body.setAttribute('onselectstart', 'return false');
                if (this.runingInertialManager) {
                    this.runingInertialManager.stop();
                }
                this.mapDiv = toolbar.mapDiv;
                if (!this.mapDiv)
                    return;
                if (!this.isDrag)
                    this.isDrag = true;
                this.orgPixelX = Util.getValueOfNoPX(this.mapDiv.style.left);
                this.orgPixelY = Util.getValueOfNoPX(this.mapDiv.style.top);
                this.orgMousePixel = Util.getMousePixel(e);
                if (this.mapDiv.setCapture)
                    this.mapDiv.setCapture();
                else if (window.captureEvents)
                    window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP);
                document.onselectstart = function () { return false };
                this._touchDeltaX=this._touchDeltaY=0;
                this._lastMousePixel=this.orgMousePixel;
            }
            else if(event.targetTouches.length==2){
                this._touchOrgDis=this.getTouchDis(event);
                var t1 = event.targetTouches.item(0);
                var t2 = event.targetTouches.item(1);
                var cx =(t1.pageX-t2.pageX)/2+t2.pageX,cy=(t1.pageY-t2.pageY)/2+t2.pageY;
                this._touchCenter= Util.getCoordinateByPixel2({x:cx,y:cy}, this.map.model.getZoom(), this.map).getPoint();
            }
            Event.stop(event);
        },
        touchmove:function(event,toolbar){
            if(event.targetTouches.length==1){
                var e = event.targetTouches.item(0);
                if (!this.map.enableDrag) return;
                if (this.orgMousePixel == null || this.isDrag == false || !this.mapDiv)
                    return;
                this.newMousePixel = Util.getMousePixel(e);
                var deltaX = this._oDeltaX+ this.newMousePixel.x - this._lastMousePixel.x;
                var deltaY = this._oDeltaY+ this.newMousePixel.y - this._lastMousePixel.y;
                var isOut = Util.isMovedMapBoundOut(this.map,deltaX,deltaY);
                if((deltaX>0 && !isOut.leftOut) || (deltaX<0 && !isOut.rightOut)){
                    this.mapDiv.style.left = (this.orgPixelX + deltaX) + "px";
                    this._oDeltaX = deltaX;
                }
                if((deltaY>0 && !isOut.topOut) || (deltaY<0 && !isOut.bottomOut)){
                    this.mapDiv.style.top = (this.orgPixelY + deltaY) + "px";
                    this._oDeltaY = deltaY;
                }
                if (this.InertialDragObject.t0) {
                    //当前瞬时速度
                    var t = (new Date()).getTime() - this.InertialDragObject.t0.time.getTime();
                    if (t != 0) {
                        this.InertialDragObject.currentVx = (this.newMousePixel.x - this.InertialDragObject.t0.px.x) / t * 1000;
                        this.InertialDragObject.currentVy = (this.newMousePixel.y - this.InertialDragObject.t0.px.y) / t * 1000;
                        //合速
                        this.InertialDragObject.currentV = Math.sqrt(this.InertialDragObject.currentVx * this.InertialDragObject.currentVx +
                            this.InertialDragObject.currentVy * this.InertialDragObject.currentVy);
                        //限速(控制滑动过程不超过2秒)
                        var maxV = 2 * 300 * 9.8
                        if (this.InertialDragObject.currentV > maxV) {
                            var k = maxV / this.InertialDragObject.currentV;
                            this.InertialDragObject.currentV = maxV;
                            this.InertialDragObject.currentVx *= k;
                            this.InertialDragObject.currentVy *= k;
                        }
                    }
                }
                this.InertialDragObject.t0 = { time: new Date(), px: this.newMousePixel };
                this._lastMousePixel = this.newMousePixel;
            }
            else if(event.targetTouches.length==2){
                var nd = this.getTouchDis(event);
                var d = this._touchZoomDis*this._touchZoomDis;
                if(this._touchOrgDis-nd>d){
                    this.map.setCenter(this._touchCenter,this.map.getZoom()-1);
                    this._touchOrgDis=nd;
                }
                else if(nd-this._touchOrgDis>d){
                    this.map.setCenter(this._touchCenter,this.map.getZoom()+1);
                    this._touchOrgDis=nd;
                }
            }
            Event.stop(event);
        },
        touchend:function(event,toolbar){
            if(event.targetTouches.length==0){
                if (!this.map.enableDrag || !this.isDrag || !this.mapDiv) return;
                Util.removeClass(this.mapDiv, "Pan-Cursor-close");
                Util.addClass(this.mapDiv, "Pan-Cursor-open");
                document.body.setAttribute('onselectstart', '');
                if (this.mapDiv.releaseCapture)
                    this.mapDiv.releaseCapture();
                else if (window.captureEvents)
                    window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP);
                if (this.map._enableInertialDragging) {
                    this.InertialDrag(function () {
                        this.map.mapControl.rPaintWithDivChanged(this.map.model);
                    });
                }
                else {
                    this.reLoadTiles(toolbar.model, this._touchDeltaX, this._touchDeltaY, this.mapDiv);
                }
                this.isDrag = false;
                Event.stop(event);
            }
        },

        //惯性拖曳
        InertialDrag: function (onComplete) {
            var inertialManager = function (v, x, j) {
                x *= 9.8;
                /*
                 摩擦系数与g的乘积x、初始瞬时速度v、时刻t
                 时刻t的时候的距离是(2*v-x*t)*t/2
                 总滑行距离是v*v/(2*x)
                 总滑行时间v/x
                 */
                this.v = v;//初速度(像素/秒)
                this.x = x;
                this.j = j;//动画执行间隔(秒)
                //this.s=v*v/(2*x);//滑行总距离
                //滑行中时间与距离的关系
                this.st = function (v, t, x) {
                    var s = (2 * v - x * t) * t / 2;
                    return s;
                }
                this.ht = Math.abs(v / x);//总滑行时长(秒)
                this.onStop = function () { };//动画执行完毕调用的函数
                this.start = function (f) {
                    var me = this;
                    var time = 0;
                    this.run = setInterval(function () {
                        time += me.j;
                        var t = time > me.ht ? me.ht : time;
                        f(me.st(me.v, t, me.x));
                        if (time >= me.ht) {
                            me.stop();
                        }
                    }, this.j * 1000);
                };
                this.stop = function () {
                    clearInterval(this.run);
                    if (this.onStop) this.onStop();
                };
            }

            var me = this;
            var sx = Util.getValueOfNoPX(this.mapDiv.style.left);
            var sy = Util.getValueOfNoPX(this.mapDiv.style.top);

            var hx = 300;//摩擦系数
            var m = new inertialManager(this.InertialDragObject.currentV, hx, 0.05);
            m.onStop = function () {
                onComplete();
            };
            m.start(function (s) {
                if (isNaN(s)) s = 0;
                var f_x = s * (me.InertialDragObject.currentVx / me.InertialDragObject.currentV);
                var f_y = s * (me.InertialDragObject.currentVy / me.InertialDragObject.currentV);
                if (me.InertialDragObject.currentV <= 0.0001) {
                    f_x = 0; f_y = 0;
                }
                me.mapDiv.style.left = sx + f_x + "px";
                me.mapDiv.style.top = sy + f_y + "px";
                this.map.mapControl.rPaintWithDivChanged(this.map.model);
            });

            this.runingInertialManager = m;
        },

        ClearSelect: function () {
            Util.removeClass(this.mapDiv, "Pan-Cursor-open");
        },

        OnSelect: function () {
            Util.addClass(this.mapDiv, "Pan-Cursor-open");
        }

    });
})();
(function () {
    //画面
    HTMap.PolygonTool = Class.create();
    HTMap.PolygonTool.prototype = Object.extend(new Abstract.Tool(), {
        isDrag: false,
        measure: new Array(),
        firstX: 0,
        firstY: 0,
        pxPoints: null,
        polyline: "",
        vPolyline: "",

        getPointStr: function () {
            return this.pxPoints.join(',');
        },

        mouseDownHandler: function (e, toolbar) {
            var mpx = Util.getMouseRelativePixel(e, this.mapDiv);
            this.mouseDownPixel = { x: Math.floor(mpx.x), y: Math.floor(mpx.y) };
            var coord = Util.getCoordinateByPixel(this.mouseDownPixel, toolbar.model.getZoom());
            this.measure.push(new HTMap.CPoint(coord.x / 1e16, coord.y / 1e16));
            if (!this.isDrag) this.isDrag = true;
            this.lastX = this.mouseDownPixel.x;
            this.lastY = this.mouseDownPixel.y;
            if (!this.vLine) {
                this.vLine = this.drawPaper.path("M{0},{1}L{0},{1}".format(Math.floor(this.mouseDownPixel.x), Math.floor(this.mouseDownPixel.y))).attr(
                    {
                        "stroke-width": "1",
                        "stroke": "#FF0000",
                        "fill": "#FF0000",
                        "fill-opacity": 0.5
                    }
                );
            }
            else {
                var path = this.vLine.attr("path").toString() + "L{0},{1}".format(Math.floor(this.mouseDownPixel.x), Math.floor(this.mouseDownPixel.y));//增加一个点
                this.vLine.attr("path", path);
            }
            Event.stop(e);
        },

        mouseMoveHandler: function (e, toolbar) {
            if (!this.isDrag)
                return;
            this.mouseMovePixel = Util.getMouseRelativePixel(e, this.mapDiv);
            var path = this.vLine.attr("path");
            var a = path.toString().split("L");
            a[a.length - 1] = "{0},{1}".format(Math.floor(this.mouseMovePixel.x), Math.floor(this.mouseMovePixel.y));//修改最后一个点的位置
            this.vLine.attr("path", a.join("L"));
            Event.stop(e);
        },

        mouseUpHandler: function (e, toolbar) {
            Event.stop(e);
        },

        dblClickHandler: function (e, movel) {
            if (!this.isDrag || !this.vLine) return;
            this.vLine.remove();
            this.vLine = null;
            var polygon = new HTMap.Polygon(this.measure);
            this.map.addOverLayer(polygon);
            this.measure = new Array();
            this.isDrag = false;
            Event.stop(e);
            this.triggerEvent("addOverlay", { sender: this, overlay: polygon });
        },

        clickHandler: function (e, model) {
            Event.stop(e);
        },

        ClearSelect: function () {
            if (this.vLine) this.vLine.remove();
            this.measure = [];
            Util.removeClass(this.mapDiv, "Polyline-Cursor");
        },

        OnSelect: function () {
            Util.addClass(this.mapDiv, "Polyline-Cursor");
        }
    });
})();
(function () {
    //画框
    HTMap.RectTool = Class.create();
    HTMap.RectTool.prototype = Object.extend(new Abstract.Tool(), {
        isDrag: false,
        measure: new Array(),

        mouseDownHandler: function (e, toolbar) {
            if (this.isDrag)return;
            var mpx = Util.getMouseRelativePixel(e, this.mapDiv);
            this.mouseDownPixel = { x: Math.floor(mpx.x), y: Math.floor(mpx.y) };
            var coord = Util.getCoordinateByPixel(this.mouseDownPixel, toolbar.model.getZoom());
            this.measure.push(new HTMap.CPoint(coord.x / 1e16, coord.y / 1e16));
            if (!this.isDrag) this.isDrag = true;
            this.lastX = this.mouseDownPixel.x;
            this.lastY = this.mouseDownPixel.y;
            if (!this.isDrag)
                this.isDrag = true;
            this.rect = this.drawPaper.path("M{x1},{y1}L{x2},{y1}L{x2},{y2}L{x1},{y2}L{x1},{y1}".format(
                {
                    x1: Math.floor(this.mouseDownPixel.x),
                    y1: Math.floor(this.mouseDownPixel.y),
                    x2: Math.floor(this.mouseDownPixel.x),
                    y2: Math.floor(this.mouseDownPixel.y)
                })).attr(
                {
                    "fill": "#FF0000",
                    "fill-opacity": 0.5
                }
            );
            Event.stop(e);
        },

        mouseMoveHandler: function (e, toolbar) {
            if (!this.isDrag)return;
            this.mouseMovePixel = Util.getMouseRelativePixel(e, this.mapDiv);
            var dx = this.mouseMovePixel.x - this.lastX;
            var dy = this.mouseMovePixel.y - this.lastY;
            if (window.event.shiftKey) {
                var max = Math.max(Math.abs(dx), Math.abs(dy));
                dx = dx * max > 0 ? max : -max;
                dy = dy * max > 0 ? max : -max;
                this.mouseMovePixel.x = dx + this.lastX;
                this.mouseMovePixel.y = dy + this.lastY;
            }
            this.rect.attr({
                path: "M{x1},{y1}L{x2},{y1}L{x2},{y2}L{x1},{y2}L{x1},{y1}".format(
                    {
                        x1: Math.floor(this.lastX),
                        y1: Math.floor(this.lastY),
                        x2: Math.floor(this.mouseMovePixel.x),
                        y2: Math.floor(this.mouseMovePixel.y)
                    })
            });
            Event.stop(e);
        },

        mouseUpHandler: function (e, toolbar) {
            if (!this.isDrag)return;
            this.mouseUpPixel = Util.getMouseRelativePixel(e, this.mapDiv);
            if (window.event.shiftKey) {
                var dx = this.mouseUpPixel.x - this.lastX;
                var dy = this.mouseUpPixel.y - this.lastY;
                var max = Math.max(Math.abs(dx), Math.abs(dy));
                dx = dx * max > 0 ? max : -max;
                dy = dy * max > 0 ? max : -max;
                this.mouseUpPixel.x = dx + this.lastX;
                this.mouseUpPixel.y = dy + this.lastY;
            }
            var coord = Util.getCoordinateByPixel(this.mouseUpPixel, toolbar.model.getZoom());
            this.measure.push(new HTMap.CPoint(coord.x / 1e16, coord.y / 1e16));
            var nRect = new HTMap.Rect(this.measure);
            this.map.addOverLayer(nRect);
            this.measure = new Array();
            this.isDrag = false;
            this.rect.remove();
            this.rect = null;
            Event.stop(e);

            this.triggerEvent("addOverlay", { sender: this, overlay: nRect });
        },

        dblClickHandler: function (e, movel) {
            Event.stop(e);
        },

        clickHandler: function (e, model) {
            Event.stop(e);
        },

        ClearSelect: function () {
            if (this.RectDiv) this.RectDiv.innerHTML = "";
            this.isDrag = false;
            Util.removeClass(this.mapDiv, "Rect-Cursor");
        },

        OnSelect: function () {
            Util.addClass(this.mapDiv, "Rect-Cursor");
        }
    });
})();
(function () {
    //拉框放大
    HTMap.ZoominTool = Class.create();
    HTMap.ZoominTool.prototype = Object.extend(new Abstract.Tool(), {
        mouseDownHandler: function (e, toolbar) {
            this.mapDiv = toolbar.mapDiv;
            this.mouseDownPixel = Util.getMouseRelativePixel(e, this.mapDiv);

            this.zoomBox = Util.createDiv('zoomBox', this.mouseDownPixel.x, this.mouseDownPixel.y, null, null, null, "absolute", "1px solid red");
            this.zoomBox.style.backgroundColor = "white";
            this.zoomBox.style.filter = "alpha(opacity=50)";
            this.zoomBox.style.opacity = "0.50";
            this.zoomBox.style.fontSize = "1px";
            this.mapDiv.appendChild(this.zoomBox);
            Event.stop(e);
        },

        mouseMoveHandler: function (e, toolbar) {
            this.mapDiv = toolbar.mapDiv;
            this.mouseMovePixel = Util.getMouseRelativePixel(e, this.mapDiv);

            if (this.mouseDownPixel) {
                var deltaX = Math.abs(this.mouseDownPixel.x - this.mouseMovePixel.x);
                var deltaY = Math.abs(this.mouseDownPixel.y - this.mouseMovePixel.y);
                this.zoomBox.style.width = Math.max(1, deltaX) + "px";
                this.zoomBox.style.height = Math.max(1, deltaY) + "px";
                if (this.mouseMovePixel.x < this.mouseDownPixel.x)
                    this.zoomBox.style.left = this.mouseMovePixel.x + "px";
                if (this.mouseMovePixel.y < this.mouseDownPixel.y)
                    this.zoomBox.style.top = this.mouseMovePixel.y + "px";
            }
            Event.stop(e);
        },

        mouseUpHandler: function (e, toolbar) {
            if (this.mouseDownPixel && this.mouseMovePixel) {
                var top = Math.min(this.mouseDownPixel.y, this.mouseMovePixel.y);
                var bottom = Math.max(this.mouseDownPixel.y, this.mouseMovePixel.y);
                var left = Math.min(this.mouseDownPixel.x, this.mouseMovePixel.x);
                var right = Math.max(this.mouseDownPixel.x, this.mouseMovePixel.x);

                var leftTop = Util.getCoordinateByPixel({ x: left, y: top }, toolbar.model.getZoom())
                var rightbottom = Util.getCoordinateByPixel({ x: right, y: bottom }, toolbar.model.getZoom())
                var rect = new HTMap.Rectangle(leftTop.x / 1e16, rightbottom.x / 1e16, leftTop.y / 1e16, rightbottom.y / 1e16);
                this.removeZoomBox(this.zoomBox);
                this.zoomToExtent(toolbar.model, rect, this.mapDiv.parentNode, "zoomin");
            }
            document.onselectstart = function () { return false };
            this.coord = null;
            this.newCoord = null;
            Event.stop(e);
        },

        zoomToExtent: function (model, extent, container, direction) {
            if (extent) {
                var zoom = model.getZoom();

                var w1 = zoom.getViewBoundByCenter(container, this.map.model.viewCenterCoord).getPixelWidth(zoom);
                var h1 = zoom.getViewBoundByCenter(container, this.map.model.viewCenterCoord).getPixelHeight(zoom);
                var w2 = extent.getPixelWidth(zoom);
                var h2 = extent.getPixelHeight(zoom);
                var r1 = Math.sqrt(w1 * w1 + h1 * h1);
                var r2 = Math.sqrt(w2 * w2 + h2 * h2);
                var deltalLevel = Math.floor(r1 / r2);
                if (w2 < 1 || h2 < 1)
                    return;
                var orgLevel = zoom.getLevel();
                if (deltalLevel > 3) deltalLevel = 3;
                switch (direction) {
                    case 'zoomin':
                        orgLevel += deltalLevel;
                        if (orgLevel > HTMap.mapConfig.MaxZoomLevel) orgLevel = HTMap.mapConfig.MaxZoomLevel;
                        break;
                    case 'zoomout':
                        orgLevel -= deltalLevel;
                        if (orgLevel < HTMap.mapConfig.MinZoomLevel) orgLevel = HTMap.mapConfig.MinZoomLevel;
                        if (orgLevel < 1) orgLevel = 1;
                        break;
                }
                model.setZoom(new HTMap.Zoom(orgLevel));
                model.setViewCenterCoord(extent.getCenter());
                this.map.mapControl.paint(model, true);
            }
        },

        removeZoomBox: function (zoom) {
            if (!zoom) return;
            this.mapDiv.removeChild(zoom);
            zoom = null;
        },

        clickHandler: function (e, movel) {
            this.map.setZoom(this.map.getZoom() + 1);
            Event.stop(e);
        },

        dblClickHandler: function (e, movel) {
            Event.stop(e);
        },

        OnSelect: function () {
            Util.addClass(this.mapDiv, 'Zoomin');
        },

        ClearSelect: function () {
            Util.removeClass(this.mapDiv, 'Zoomin');
        }
    });
})();
(function () {
    //拉框缩小
    HTMap.ZoomoutTool = Class.create();
    HTMap.ZoomoutTool.prototype = Object.extend(new Abstract.Tool(), {

        mouseDownHandler: function (e, toolbar) {
            this.mapDiv = toolbar.mapDiv;
            this.mouseDownPixel = Util.getMouseRelativePixel(e, this.mapDiv);

            this.zoomBox = Util.createDiv('zoomBox', this.mouseDownPixel.x, this.mouseDownPixel.y, null, null, null, "absolute", "1px solid red");
            this.zoomBox.style.backgroundColor = "white";
            this.zoomBox.style.filter = "alpha(opacity=50)";
            this.zoomBox.style.opacity = "0.50";
            this.zoomBox.style.fontSize = "1px";
            this.mapDiv.appendChild(this.zoomBox);
            Event.stop(e);
        },

        mouseMoveHandler: function (e, toolbar) {
            this.mapDiv = toolbar.mapDiv;
            this.mouseMovePixel = Util.getMouseRelativePixel(e, this.mapDiv);

            if (this.mouseDownPixel) {
                var deltaX = Math.abs(this.mouseDownPixel.x - this.mouseMovePixel.x);
                var deltaY = Math.abs(this.mouseDownPixel.y - this.mouseMovePixel.y);
                this.zoomBox.style.width = Math.max(1, deltaX) + "px";
                this.zoomBox.style.height = Math.max(1, deltaY) + "px";
                if (this.mouseMovePixel.x < this.mouseDownPixel.x)
                    this.zoomBox.style.left = this.mouseMovePixel.x + "px";
                if (this.mouseMovePixel.y < this.mouseDownPixel.y)
                    this.zoomBox.style.top = this.mouseMovePixel.y + "px";
            }
            Event.stop(e);
        },

        mouseUpHandler: function (e, toolbar) {
            if (this.mouseDownPixel && this.mouseMovePixel) {
                var top = Math.min(this.mouseDownPixel.y, this.mouseMovePixel.y);
                var bottom = Math.max(this.mouseDownPixel.y, this.mouseMovePixel.y);
                var left = Math.min(this.mouseDownPixel.x, this.mouseMovePixel.x);
                var right = Math.max(this.mouseDownPixel.x, this.mouseMovePixel.x);

                var leftTop = Util.getCoordinateByPixel({ x: left, y: top }, toolbar.model.getZoom())
                var rightbottom = Util.getCoordinateByPixel({ x: right, y: bottom }, toolbar.model.getZoom())
                var rect = new HTMap.Rectangle(leftTop.x / 1e16, rightbottom.x / 1e16, leftTop.y / 1e16, rightbottom.y / 1e16);
                this.removeZoomBox(this.zoomBox);
                this.zoomToExtent(toolbar.model, rect, this.mapDiv.parentNode, "zoomout");

            }
            document.onselectstart = function () { return false };
            this.coord = null;
            this.newCoord = null;
            Event.stop(e);
        },

        clickHandler: function (e, movel) {
            this.map.setZoom(this.map.getZoom() - 1);
            Event.stop(e);
        },

        dblClickHandler: function (e, movel) {
            Event.stop(e);
        },

        zoomToExtent: function (model, extent, container, direction) {
            if (extent) {
                var zoom = model.getZoom();

                var w1 = zoom.getViewBoundByCenter(container, this.map.model.viewCenterCoord).getPixelWidth(zoom);
                var h1 = zoom.getViewBoundByCenter(container, this.map.model.viewCenterCoord).getPixelHeight(zoom);
                var w2 = extent.getPixelWidth(zoom);
                var h2 = extent.getPixelHeight(zoom);
                var r1 = Math.sqrt(w1 * w1 + h1 * h1);
                var r2 = Math.sqrt(w2 * w2 + h2 * h2);
                var deltalLevel = Math.floor(r1 / r2);
                if (w2 < 1 || h2 < 1)
                    return;
                var orgLevel = zoom.getLevel();
                if (deltalLevel > 3) deltalLevel = 3;
                switch (direction) {
                    case 'zoomin':
                        orgLevel += deltalLevel;
                        if (orgLevel > HTMap.mapConfig.MaxZoomLevel) orgLevel = HTMap.mapConfig.MaxZoomLevel;
                        break;
                    case 'zoomout':
                        orgLevel -= deltalLevel;
                        if (orgLevel < HTMap.mapConfig.MinZoomLevel) orgLevel = HTMap.mapConfig.MinZoomLevel;
                        if (orgLevel < 1) orgLevel = 1;
                        break;
                }
                model.setZoom(new HTMap.Zoom(orgLevel));
                model.setViewCenterCoord(extent.getCenter());
                model.controls[container.childNodes[0].id].paint(model, true);
            }
        },

        removeZoomBox: function (zoom) {
            if (!zoom) return;
            this.mapDiv.removeChild(zoom);
            zoom = null;
        },

        OnSelect: function () {
            Util.addClass(this.mapDiv, 'Zoomout');
        },

        ClearSelect: function () {
            Util.removeClass(this.mapDiv, 'Zoomout');
        }
    });
})();